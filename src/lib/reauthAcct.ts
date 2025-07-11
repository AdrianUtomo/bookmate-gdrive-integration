export async function reauthAcct(user: any) {
  if (user) {
    const googleAccount = user?.externalAccounts.find(
      (ea: any) => ea.provider === "google" && ea.verification.status === "verified" && !ea.verification.error
    );

    if (!googleAccount) {
      try {
        await user.createExternalAccount({
          strategy: "oauth_google",
          redirectUrl: window.location.href,
        });
      } catch (error) {
        console.error("Error connecting Google Account", error);
      }
    }

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