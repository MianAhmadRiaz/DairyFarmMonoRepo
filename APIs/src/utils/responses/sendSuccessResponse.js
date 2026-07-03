const sendSuccessResponse = (res, statusCode = 200, success = true, message = "", type = "", data = {}) => {
    const successObject = {
      statusCode,
      success,
      message,
    };
    if (type) successObject.type = type;
    if (Object.keys(data).length > 0) successObject.data = data;
    return res.status(statusCode).json(successObject);
  };
  
  export default sendSuccessResponse;
  