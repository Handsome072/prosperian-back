const supabase = require('../config/supabase');

const fileResolvers = {
  Query: {
    files: async () => {
      try {
        const { data, error } = await supabase.from('file').select('*');
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to fetch files: ${error.message}`);
        }
        return data || [];
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    file: async (_, { id }) => {
      try {
        const { data, error } = await supabase.from('file').select('*').eq('id', id).single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to fetch file: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
  },
  Mutation: {
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
        console.log('Updating file with id:', id, 'input:', input);
        const { data, error } = await supabase.from('file').update(input).eq('id', id).select('*').single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to update file: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
    deleteFile: async (_, { id }) => {
      try {
        console.log('Deleting file with id:', id);
        const { error } = await supabase.from('file').delete().eq('id', id);
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to delete file: ${error.message}`);
        }
        return true;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
  },
  File: {
    company: async (file) => {
      if (!file.company_id) return null;
      try {
        const { data, error } = await supabase.from('company').select('*').eq('id', file.company_id).single();
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to fetch company for file: ${error.message}`);
        }
        return data;
      } catch (error) {
        console.error('Server error:', error.message);
        throw new Error(`Server error: ${error.message}`);
      }
    },
  },
};

module.exports = fileResolvers;