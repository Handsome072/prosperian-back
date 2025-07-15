const supabase = require('../config/supabase');

const companyResolvers = {
  Query: {
    companies: async () => {
      const { data, error } = await supabase.from('company').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    company: async (_, { id }) => {
      const { data, error } = await supabase.from('company').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    establishments: async () => {
      const { data, error } = await supabase.from('establishment').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    establishment: async (_, { id }) => {
      const { data, error } = await supabase.from('establishment').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    officers: async () => {
      const { data, error } = await supabase.from('officer').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    officer: async (_, { id }) => {
      const { data, error } = await supabase.from('officer').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    files: async () => {
      const { data, error } = await supabase.from('file').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    file: async (_, { id }) => {
      const { data, error } = await supabase.from('file').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    beneficialOwners: async () => {
      const { data, error } = await supabase.from('beneficial_owner').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    beneficialOwner: async (_, { id }) => {
      const { data, error } = await supabase.from('beneficial_owner').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    financialStatements: async () => {
      const { data, error } = await supabase.from('financial_statement').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    financialStatement: async (_, { id }) => {
      const { data, error } = await supabase.from('financial_statement').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    riskAssessments: async () => {
      const { data, error } = await supabase.from('risk_assessment').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    riskAssessment: async (_, { id }) => {
      const { data, error } = await supabase.from('risk_assessment').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    bodaccNotices: async () => {
      const { data, error } = await supabase.from('bodacc_notice').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    bodaccNotice: async (_, { id }) => {
      const { data, error } = await supabase.from('bodacc_notice').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    legalActs: async () => {
      const { data, error } = await supabase.from('legal_act').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    legalAct: async (_, { id }) => {
      const { data, error } = await supabase.from('legal_act').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    webInfos: async () => {
      const { data, error } = await supabase.from('web_info').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    webInfo: async (_, { id }) => {
      const { data, error } = await supabase.from('web_info').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    emails: async () => {
      const { data, error } = await supabase.from('email').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    email: async (_, { id }) => {
      const { data, error } = await supabase.from('email').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
    addresses: async () => {
      const { data, error } = await supabase.from('address').select('*');
      if (error) throw new Error(`Query error: ${error.message}`);
      return data || [];
    },
    address: async (_, { id }) => {
      const { data, error } = await supabase.from('address').select('*').eq('id', id).single();
      if (error) throw new Error(`Query error: ${error.message}`);
      return data;
    },
  },
  Mutation: {
    createCompany: async (_, { input }) => {
      try {
        console.log('Creating company with input:', input);
        const { data, error } = await supabase.from('company').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create company: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateCompany: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('company').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update company: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteCompany: async (_, { id }) => {
      try {
        const { error } = await supabase.from('company').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createEstablishment: async (_, { input }) => {
      try {
        console.log('Creating establishment with input:', input);
        const { data, error } = await supabase.from('establishment').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create establishment: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateEstablishment: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('establishment').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update establishment: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteEstablishment: async (_, { id }) => {
      try {
        const { error } = await supabase.from('establishment').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createOfficer: async (_, { input }) => {
      try {
        console.log('Creating officer with input:', input);
        const { data, error } = await supabase.from('officer').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create officer: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateOfficer: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('officer').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update officer: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteOfficer: async (_, { id }) => {
      try {
        const { error } = await supabase.from('officer').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createFile: async (_, { input }) => {
      try {
        console.log('Creating file with input:', input);
        const { data, error } = await supabase.from('file').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create file: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateFile: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('file').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update file: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteFile: async (_, { id }) => {
      try {
        const { error } = await supabase.from('file').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createBeneficialOwner: async (_, { input }) => {
      try {
        console.log('Creating beneficial owner with input:', input);
        const { data, error } = await supabase.from('beneficial_owner').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create beneficial owner: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateBeneficialOwner: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('beneficial_owner').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update beneficial owner: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteBeneficialOwner: async (_, { id }) => {
      try {
        const { error } = await supabase.from('beneficial_owner').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createFinancialStatement: async (_, { input }) => {
      try {
        console.log('Creating financial statement with input:', input);
        const { data, error } = await supabase.from('financial_statement').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create financial statement: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateFinancialStatement: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('financial_statement').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update financial statement: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteFinancialStatement: async (_, { id }) => {
      try {
        const { error } = await supabase.from('financial_statement').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createRiskAssessment: async (_, { input }) => {
      try {
        console.log('Creating risk assessment with input:', input);
        const { data, error } = await supabase.from('risk_assessment').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create risk assessment: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateRiskAssessment: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('risk_assessment').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update risk assessment: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteRiskAssessment: async (_, { id }) => {
      try {
        const { error } = await supabase.from('risk_assessment').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createBodaccNotice: async (_, { input }) => {
      try {
        console.log('Creating BODACC notice with input:', input);
        const { data, error } = await supabase.from('bodacc_notice').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create BODACC notice: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateBodaccNotice: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('bodacc_notice').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update BODACC notice: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteBodaccNotice: async (_, { id }) => {
      try {
        const { error } = await supabase.from('bodacc_notice').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createLegalAct: async (_, { input }) => {
      try {
        console.log('Creating legal act with input:', input);
        const { data, error } = await supabase.from('legal_act').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create legal act: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateLegalAct: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('legal_act').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update legal act: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteLegalAct: async (_, { id }) => {
      try {
        const { error } = await supabase.from('legal_act').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createWebInfo: async (_, { input }) => {
      try {
        console.log('Creating web info with input:', input);
        const { data, error } = await supabase.from('web_info').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create web info: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateWebInfo: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('web_info').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update web info: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteWebInfo: async (_, { id }) => {
      try {
        const { error } = await supabase.from('web_info').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createEmail: async (_, { input }) => {
      try {
        console.log('Creating email with input:', input);
        const { data, error } = await supabase.from('email').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create email: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateEmail: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('email').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update email: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteEmail: async (_, { id }) => {
      try {
        const { error } = await supabase.from('email').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    createAddress: async (_, { input }) => {
      try {
        console.log('Creating address with input:', input);
        const { data, error } = await supabase.from('address').insert(input).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to create address: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    updateAddress: async (_, { id, input }) => {
      try {
        const { data, error } = await supabase.from('address').update(input).eq('id', id).select('*').single();
        if (error) throw new Error(`Failed to update address: ${error.message}`);
        return data;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteAddress: async (_, { id }) => {
      try {
        const { error } = await supabase.from('address').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return true;
      } catch (error) {
        throw new Error(`Server error: ${error.message}`);
      }
    },
  },
  Company: {
    establishments: async (company) => {
      const { data, error } = await supabase.from('establishment').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    officers: async (company) => {
      const { data, error } = await supabase.from('officer').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    beneficial_owners: async (company) => {
      const { data, error } = await supabase.from('beneficial_owner').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    financial_statements: async (company) => {
      const { data, error } = await supabase.from('financial_statement').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    risk_assessment: async (company) => {
      const { data, error } = await supabase.from('risk_assessment').select('*').eq('id', company.id).single();
      if (error) throw new Error(error.message);
      return data || null;
    },
    bodacc_notices: async (company) => {
      const { data, error } = await supabase.from('bodacc_notice').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    legal_acts: async (company) => {
      const { data, error } = await supabase.from('legal_act').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
    web_info: async (company) => {
      const { data, error } = await supabase.from('web_info').select('*').eq('id', company.id).single();
      if (error) throw new Error(error.message);
      return data || null;
    },
    emails: async (company) => {
      const { data, error } = await supabase.from('email').select('*').eq('company_id', company.id);
      if (error) throw new Error(error.message);
      return data || [];
    },
  },
  Establishment: {
    address: async (establishment) => {
      if (!establishment.address_id) return null;
      const { data, error } = await supabase.from('address').select('*').eq('id', establishment.address_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    company: async (establishment) => {
      if (!establishment.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', establishment.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  Officer: {
    company: async (officer) => {
      if (!officer.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', officer.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  File: {
    company: async (file) => {
      if (!file.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', file.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  BeneficialOwner: {
    company: async (beneficialOwner) => {
      if (!beneficialOwner.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', beneficialOwner.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  FinancialStatement: {
    company: async (financialStatement) => {
      if (!financialStatement.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', financialStatement.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  RiskAssessment: {
    company: async (riskAssessment) => {
      if (!riskAssessment.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', riskAssessment.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  BodaccNotice: {
    company: async (bodaccNotice) => {
      if (!bodaccNotice.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', bodaccNotice.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  LegalAct: {
    company: async (legalAct) => {
      if (!legalAct.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', legalAct.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  WebInfo: {
    company: async (webInfo) => {
      if (!webInfo.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', webInfo.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  Email: {
    company: async (email) => {
      if (!email.company_id) return null;
      const { data, error } = await supabase.from('company').select('*').eq('id', email.company_id).single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
};

module.exports = companyResolvers;