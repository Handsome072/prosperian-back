const companyResolvers = require('./company');
const fileResolvers = require('./file');

module.exports = {
  Query: {
    ...companyResolvers.Query,
    ...fileResolvers.Query,
  },
  Mutation: {
    ...companyResolvers.Mutation,
    ...fileResolvers.Mutation,
  },
  Company: companyResolvers.Company,
  Establishment: companyResolvers.Establishment,
  Officer: companyResolvers.Officer,
  File: companyResolvers.File,
};