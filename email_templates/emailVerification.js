const otpVerification = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en" style="scroll-behavior:smooth;">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to the tribe</title>
        
      </head>
      <body style='margin:0;padding:0;font-family:"Raleway", sans-serif;'>
        <center class="wrapper" style="table-layout:fixed;">
          <div class="container" style="max-width:700px;">
            <table class="mailContainer" align="center" style="border-spacing:0;margin:2em 0;padding:3em 0.8em;border-radius:40px;width:100%;max-width:750px;">
              <tr>
                <td style="padding:0;">
                  <table class="contentBox" style="border-spacing:0;border:0.5px solid #52525b;box-shadow:0px 32px 64px rgba(17, 17, 17, 0.08);border-radius:0px 16px;text-align:center;padding-bottom:1em;">
                    <tr>
                      <td style="padding:0;">
                        <table class="contentBoxInner" style="border-spacing:0;width:90%;margin:auto;text-align:center;display:flex;justify-content:center;align-items:center;">
                          <tr>
                            <td style="padding:0;">
                              <table width="100%" class="logoBox" style="border-spacing:0;margin:0.3em auto 1em auto;">
                                <tr>
                                  <td style="padding:0;">
                                    <a href="" style="color:inherit;text-decoration:none;">
                                      <img src="https://i.ibb.co/4tfXvR1/logopng.png" width="180" style="border:0;">
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <table width="100%" class="heroTop" style="border-spacing:0;">
                                <tr>
                                  <td style="padding:0;">
                                    <img src="https://i.ibb.co/tZWSq4W/welcome.png" alt="welcomeText" style="border:0;width:90%;">
                                  </td>
                                </tr>
                              </table>
                              <table width="100%" class="heroImg" style="border-spacing:0;">
                                <tr>
                                  <td style="padding:0;">
                                    <!-- <img src="assets/hero.svg" alt="" /> -->
                                    <img src="https://i.ibb.co/sQB5LmK/hero.png" alt="hero" width="0px" style="border:0;width:85%;">
                                  </td>
                                </tr>
                              </table>
                              <table width="100%" class="lineBx" style="border-spacing:0;">
                                <tr>
                                  <td style="padding:0;">
                                    <div class="line" style="height:1px;width:70%;margin:auto;"></div>
                                  </td>
                                </tr>
                              </table>
                              <table width="100%" class="contentTxt" style="border-spacing:0;text-align:center;margin:1em auto;">
                                <tr>
                                  <td style="padding:0;">
                                    <!-- <h4>Confirm your email address</h4> -->
                                    <p style="font-weight:lighter;font-size:14px;line-height:19px;margin-top: 0.5em;">
                                      Hi there, you are required to confirm the
                                      following One-Time-Password (OTP) on the
                                      website.
                                      <br/><br/>
                                      Your One-Time-Password is :
                                      <br/><br/>
                                      <strong>${code}</strong>
                                      <br/><br/>
                                      If you did not sign up your email address on
                                      the site you can ignore this email.
                                    </p>
                                    <!-- <p style="margin-top: .5em;">Hi there, you are all set to
                                                                    receive some of the most juicy updates about NFTs on the
                                                                    nfty tribe marketplace</p> -->
                                  </td>
                                </tr>
                              </table>
                              <table width="100%" class="contentActions" style="border-spacing:0;">
                                <tr>
                                  <td style="padding:0;">
                                    <!-- <button>Confirm email address</button> -->
                                    <table class="contentBtns" style="border-spacing:0;text-align:center;width:100%;margin:0.3em 0 2.5em 0;">
                                      <tr>
                                        <td style="padding:0;">
                                          <a href="https://twitter.com/NftyTribe" style="color:inherit;text-decoration:none;">
                                            <img src="https://i.ibb.co/S6CvYrT/twitter.png" alt="twitter" width="25px" style="border:0;cursor:pointer;">
                                          </a>
                                          <a href="https://www.instagram.com/nftytribe/" style="color:inherit;text-decoration:none;">
                                            <img class="icon" src="https://i.ibb.co/KjhGdQS/ig.png" alt="ig" width="25px" style="border:0;margin-left:3em;cursor:pointer;">
                                          </a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              <table class="follow" style="border-spacing:0;margin:0 auto;position:relative;width:100%;color:#b6b6b6;">
                                <tr>
                                  <td style="padding:0;">
                                    <a href="https://twitter.com/NftyTribe" style="color:inherit;text-decoration:none;">
                                      <p style="cursor:pointer;text-decoration:none;text-align:left;color: #4d55a6; font-size: 12px;">
                                        Follow @nftytribe on twitter →
                                      </p>
                                    </a>
                                    <p style="cursor:pointer;text-decoration:none;text-align:left;position:absolute;right:0;top:0;text-decoration:underline;font-size: 12px;" class="sTxt">
                                      Unsubscribe
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </center>
      </body>
    </html>
  `;
};
module.exports = otpVerification;
