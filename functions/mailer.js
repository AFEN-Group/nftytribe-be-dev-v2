const Mailchimp = require("@mailchimp/mailchimp_transactional");
const config = process.env;
class Mailer {
  constructor(user, name) {
    if (!user)
      throw {
        message: "include a user e.g noreply",
      };
    this.sender = `${user}@nftytribe.io`;
    this.name = name || user;
  }
  mailchimp = Mailchimp(config.mailchimp_transactional_key);
  sendEmail = async ({ subject, html, to = [] }) => {
    const response = await this.mailchimp.messages.send({
      message: {
        subject,
        to,
        from_email: this.sender,
        from_name: this.name,
        html,
      },
    });
    // console.log(response);
    return response;
  };
}

export default Mailer;
