export const environment = {
  production: true,
  apiAuthEndpoint:
    document.location.protocol + //http
    '//' +
    document.location.hostname + //indirizzo ip corrente
    ':' +
    5006, //la porta che dipende dal server di c#

  apiGameEndpoint:
    document.location.protocol + //http
    '//' +
    document.location.hostname + //indirizzo ip corrente
    ':' +
    5261, //la porta che dipende dal server di c#
};
