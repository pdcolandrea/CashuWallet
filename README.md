# CashuWallet

**⚠️ Not stable for production use**

### ./app directory

Included in an Ignite boilerplate project is the `app` directory. This is a directory you would normally have to create when using vanilla React Native.

The inside of the `app` directory looks similar to the following:

```
app
├── components
├── config
├── i18n
├── models
├── navigators
├── screens
├── services
├── theme
├── utils
├── app.tsx
```

**components**
This is where your reusable components live which help you build your screens.

**i18n**
This is where your translations will live if you are using `react-native-i18n`.

**models**
This is where your app's models will live. Each model has a directory which will contain the `mobx-state-tree` model file, test file, and any other supporting files like actions, types, etc.

**navigators**
This is where your `react-navigation` navigators will live.

**screens**
This is where your screen components will live. A screen is a React component which will take up the entire screen and be part of the navigation hierarchy. Each screen will have a directory containing the `.tsx` file, along with any assets or other helper files.

**services**
Any services that interface with the outside world will live here (think REST APIs, Push Notifications, etc.).

**theme**
Here lives the theme for your application, including spacing, colors, and typography.

**utils**
This is a great place to put miscellaneous helpers and utilities. Things like date helpers, formatters, etc. are often found here. However, it should only be used for things that are truly shared across your application. If a helper or utility is only used by a specific component or model, consider co-locating your helper with that component or model.

**app.tsx** This is the entry point to your app. This is where you will find the main App component which renders the rest of the application.

### ./ignite directory

The `ignite` directory stores all things Ignite, including CLI and boilerplate items. Here you will find templates you can customize to help you get started with React Native.

### ./test directory

This directory will hold your Jest configs and mocks.

## Running Maestro end-to-end tests

Follow our [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe from the [Ignite Cookbook](https://ignitecookbook.com/)!

## Previous Boilerplates

- [2018 aka Bowser](https://github.com/infinitered/ignite-bowser)
- [2017 aka Andross](https://github.com/infinitered/ignite-andross)
- [2016 aka Ignite 1.0](https://github.com/infinitered/ignite-ir-boilerplate-2016)

# Fund Wallet (Receive)

- Generate LN invoice: (amount: number) => CHECK_FOR_INVOICE_IN_BACKGROUND
  -- TextInput
  -->--> if invoice is paid => CASHU_ADD_BALANCE

- Receive ECash: (cashu: string) => CASHU_ADD_BALANCE
  -- Camera
  -- Paste
  -- TextInput

# Send Funds from Wallet (Withdraw)

- Pay LN invoice: (invoice, LNURL: string) => CASHU_SUB_BALANCE
  -- Camera
  -- Paste
  -- TextInput

- Pay ECash: (amount: number) => CASHU_TO_SHARE
  -- TextInput

#### OR

# ECASH

- [RECEIVE] ECash: (cashu: string) => CASHU_ADD_BALANCE
  -- Camera
  -- Paste
  -- TextInput

- [SEND/WITHDRAW] ECash: (amount: number) => CHECK_IF_TOKEN_SPENT_IN_BACKGROUND
  -- TextInput
  -->--> if token is paid => DELETE_PROOF_FROM_DB, ADD_TOKEN_TO_HISTORY

# LIGHTNING

- [RECEIVE] Generate LN invoice: (amount: number) => CHECK_FOR_INVOICE_IN_BACKGROUND => SHARE_INVOICE
  ** minting **
  -- TextInput
  -->--> if invoice is paid => CASHU_ADD_BALANCE

- [SEND/WITHDRAW] Pay LN invoice: (invoice, LNURL: string) => CASHU_SUB_BALANCE
  -- Camera
  -- Paste
  -- TextInput
