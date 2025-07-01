export async function reauthAcct(user: any) {
  if (user) {
      const googleAccount = user.externalAccounts.find(
          (ea: any) => ea.provider === "google"
      );

      const reauth = await googleAccount?.reauthorize({
          redirectUrl: window.location.href,
          additionalScopes: [
              "https://www.googleapis.com/auth/drive",
              "https://www.googleapis.com/auth/calendar.readonly",
              "https://www.googleapis.com/auth/calendar.events.readonly",
          ],
      });

      if (reauth?.verification?.externalVerificationRedirectURL) {
          window.location.href =
              reauth?.verification?.externalVerificationRedirectURL.href;
      }
  }
}