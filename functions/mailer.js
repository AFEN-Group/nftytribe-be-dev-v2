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
  /**
   *
   * @param {{html: string, subject: string, to: string[]}} param0
   * @param {Mailchimp.MessageAttachment[]} attachments
   * @returns
   */
  sendEmail = async ({ subject, html, to = [] }, attachments = []) => {
    const response = await this.mailchimp.messages.send({
      message: {
        subject,
        to: to.map((email) => ({
          type: "to",
          email,
        })),
        from_email: this.sender,
        from_name: this.name,
        html,
        attachments,
      },
    });
    // console.log(response);
    return response;
  };
}
module.exports = Mailer;
