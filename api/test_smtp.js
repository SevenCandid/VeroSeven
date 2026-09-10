const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hello.veroseven@gmail.com',
    pass: 'ngim cxad zshy cyxf'
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP CONNECTION ERROR:", error);
  } else {
    console.log("SMTP CONNECTION SUCCESS:", success);
  }
});
