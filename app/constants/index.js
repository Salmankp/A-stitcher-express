const ERROR_CODES = {
    BAD_REQUEST: 400,
    UN_AUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
    MISSING_ARGUMENTS: 419,
    INVALID_ARGUMENTS: 420,
  };
  
  const ERROR_MESSAGES = {
    BAD_REQUEST: "Invalid syntax for this request was provided.",
    UN_AUTHORIZED:
      "You are unauthorized to access the requested resource. Please log in.",
    FORBIDDEN: "Your account is not authorized to access the requested resource.",
    NOT_FOUND:
      "We could not find the resource you requested. Please refer to the documentation for the list of resources.",
    NOT_ACCEPTABLE: "Acceptance header is invalid for this endpoint resource.",
    MISSING_ARGUMENTS: "The requested resource is missing required arguments.",
    INVALID_ARGUMENTS:
      "The requested resource does not support one or more of the given parameters.",
  };
  
  const SUCCESS_CODE = 200;
  
  module.exports = {
    ERROR_CODES,
    ERROR_MESSAGES,
    SUCCESS_CODE,
  };
  