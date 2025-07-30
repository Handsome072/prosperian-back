-- =====================================================
-- TABLES POUR LE SYSTÈME DE PAIEMENT STRIPE
-- =====================================================

-- 1. Table des packs de crédits
CREATE TABLE IF NOT EXISTS public.credit_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price decimal(10,2) NOT NULL,
  stripe_price_id text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Table des abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_credits integer NOT NULL,
  price decimal(10,2) NOT NULL,
  stripe_price_id text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Table des transactions (packs de crédits)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.utilisateur(id) ON DELETE CASCADE,
  pack_id uuid REFERENCES public.credit_packs(id) ON DELETE SET NULL,
  stripe_payment_intent_id text UNIQUE,
  amount decimal(10,2) NOT NULL,
  credits integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  type text NOT NULL DEFAULT 'credit_pack' CHECK (type IN ('credit_pack', 'subscription')),
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  failed_at timestamp with time zone,
  error_message text
);

-- 4. Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.utilisateur(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Ajouter la colonne credits à la table utilisateur si elle n'existe pas
ALTER TABLE public.utilisateur 
ADD COLUMN IF NOT EXISTS credits integer DEFAULT 0;

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent_id ON public.transactions(stripe_payment_intent_id);

-- Index pour les abonnements utilisateurs
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- Index pour les packs de crédits
CREATE INDEX IF NOT EXISTS idx_credit_packs_active ON public.credit_packs(is_active);

-- Index pour les abonnements
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(is_active);

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Insérer des packs de crédits de test
INSERT INTO public.credit_packs (name, credits, price, description) VALUES
('Pack Starter', 100, 19.99, 'Pack de démarrage avec 100 crédits'),
('Pack Pro', 500, 79.99, 'Pack professionnel avec 500 crédits'),
('Pack Business', 1000, 149.99, 'Pack business avec 1000 crédits'),
('Pack Enterprise', 2500, 299.99, 'Pack entreprise avec 2500 crédits')
ON CONFLICT DO NOTHING;

-- Insérer des abonnements de test
INSERT INTO public.subscriptions (name, monthly_credits, price, description) VALUES
('Abonnement Starter', 50, 9.99, '50 crédits par mois'),
('Abonnement Pro', 200, 29.99, '200 crédits par mois'),
('Abonnement Business', 500, 59.99, '500 crédits par mois'),
('Abonnement Enterprise', 1000, 99.99, '1000 crédits par mois')
ON CONFLICT DO NOTHING;

-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques pour credit_packs (lecture publique, écriture admin)
CREATE POLICY "credit_packs_read_policy" ON public.credit_packs
  FOR SELECT USING (true);

CREATE POLICY "credit_packs_admin_policy" ON public.credit_packs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.utilisateur 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour subscriptions (lecture publique, écriture admin)
CREATE POLICY "subscriptions_read_policy" ON public.subscriptions
  FOR SELECT USING (true);

CREATE POLICY "subscriptions_admin_policy" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.utilisateur 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour transactions (utilisateur peut voir ses propres transactions)
CREATE POLICY "transactions_user_policy" ON public.transactions
  FOR ALL USING (user_id = auth.uid());

-- Politiques pour user_subscriptions (utilisateur peut voir ses propres abonnements)
CREATE POLICY "user_subscriptions_user_policy" ON public.user_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_credit_packs_updated_at 
  BEFORE UPDATE ON public.credit_packs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON public.user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE public.credit_packs IS 'Packs de crédits disponibles à l''achat';
COMMENT ON TABLE public.subscriptions IS 'Abonnements mensuels disponibles';
COMMENT ON TABLE public.transactions IS 'Historique des transactions de paiement';
COMMENT ON TABLE public.user_subscriptions IS 'Abonnements actifs des utilisateurs';
COMMENT ON COLUMN public.utilisateur.credits IS 'Nombre de crédits disponibles pour l''utilisateur'; 