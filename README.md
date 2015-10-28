# Chrome Extension for Circuit SDK Screenshare

If you are using the [Circuit SDK](https://circuitsandbox.net/sdk) in your web application and would like to provide your users the capability to share the screen or an application, then you are at the right place.

You have two options:
1. Use this exact extension from the Chrome WebStore which is branded as Circuit SDK and requires wildcard permissions
2. Clone this repo and brand it for your web application and limit the premissions to your domain

The first option is the simplest and probably enough to play with screenshare. But once you productize your application, you may want to brand it with your name and icon, and more importantly change the wildcard permissions to only allow your domain.

This extension has been submitted, but is not yet available in the WebStore. Check again in a couple of days.


## Branding

In the manifest.json file:
* Change the name, version, description, short_name
* Change the wildcard permission `https://*/*` to your domain, e.g. `https://*.company.com/*`. For more information on permissions see [Declare Permissions](https://developer.chrome.com/extensions/declare_permissions).
* Change the icons in the img folder


## Load the extension for development

Navigate to `chrome://extensions`, enable `Developer mode`, click `Load your unpacked extension` and navigating to the chrome-ext folder you modified.


## Run the screenshare example

A screenshare example is available [here](https://github.com/yourcircuit/js-sdk) with a live example [here](https://rawgit.com/yourcircuit/js-sdk/master/screenshare.html).


## Productize your branded extension

To productize your branded extension you will need to publish it to the Chrome WebStore. This is the only support distribution channel by Google.

Read [Publish your app](https://developer.chrome.com/webstore/publish) for instructions.


## Resources

[Circuit](https://circuit.com)
[Circuit Developer Portal](https://developers.circuit.com)
[Circuit Developer Registration](https://developers.circuit.com/registration)
[Circuit SDK Documentation](https://circuitsandbox.net/sdk)
[Circuit SDK Codepen examples](http://codepen.io/circuit/)
[Circuit on Github](https://github.com/yourcircuit)
[What are extensions](https://developer.chrome.com/extensions)
