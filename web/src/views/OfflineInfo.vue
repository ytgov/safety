<template>
  <h1 class="text-h4">Submitting Reports Offline</h1>
  <p class="text-body-2 mt-2 mb-6">
    The YG Safety Portal can be installed on your phone, tablet, or computer as an app. Once installed, you can submit
    incident and hazard reports even when you have no internet connection. Your report will be saved on your device and
    automatically uploaded when connectivity is restored.
  </p>

  <!-- Installing the App -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Installing the App</h4>
    </v-card-item>
    <v-card-text>
      <p class="text-body-1 mb-4">
        You must install the app <strong>before</strong> you go offline. Installation requires visiting the site at
        least once with an active internet connection so that the app files can be downloaded to your device.
      </p>

      <v-expansion-panels variant="accordion" class="mb-2">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-3">mdi-apple</v-icon>
            iPhone / iPad (Safari)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ol class="ml-4">
              <li class="mb-2">Open <strong>Safari</strong> and go to the YG Safety Portal</li>
              <li class="mb-2">
                Tap the <strong>Share</strong> button (the square with an arrow pointing up) at the bottom of the screen
              </li>
              <li class="mb-2">Scroll down and tap <strong>Add to Home Screen</strong></li>
              <li class="mb-2">Tap <strong>Add</strong> in the top-right corner</li>
              <li>The app icon will appear on your home screen</li>
            </ol>
            <v-alert type="info" variant="tonal" density="compact" class="mt-4">
              Safari is required. Chrome and Firefox on iOS do not support installing web apps.
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-3">mdi-android</v-icon>
            Android (Chrome)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ol class="ml-4">
              <li class="mb-2">Open <strong>Chrome</strong> and go to the YG Safety Portal</li>
              <li class="mb-2">
                You may see a banner at the bottom saying "Add YG Safety Portal to Home screen" &mdash; tap
                <strong>Install</strong>
              </li>
              <li class="mb-2">
                If no banner appears, tap the <strong>three-dot menu</strong> in the top-right corner and tap
                <strong>Install app</strong> or <strong>Add to Home screen</strong>
              </li>
              <li>Tap <strong>Install</strong> to confirm</li>
            </ol>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="mr-3">mdi-laptop</v-icon>
            Windows / Mac (Chrome or Edge)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ol class="ml-4">
              <li class="mb-2">Open <strong>Chrome</strong> or <strong>Edge</strong> and go to the YG Safety Portal</li>
              <li class="mb-2">
                Look for the install icon in the address bar (a monitor with a down arrow, or a <strong>+</strong> icon)
              </li>
              <li class="mb-2">Click it and then click <strong>Install</strong></li>
              <li>
                The app will open in its own window and a shortcut will be added to your desktop or Start menu
              </li>
            </ol>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>

  <!-- Preparing for Offline Use -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Preparing for Offline Use</h4>
    </v-card-item>
    <v-card-text>
      <p class="text-body-1 mb-4">
        After installing the app, take these steps <strong>while you still have internet</strong> to make sure
        everything is ready:
      </p>
      <ol class="ml-4">
        <li class="mb-3">
          <strong>Open the app once</strong> from your home screen. This ensures all required files are cached on your
          device.
        </li>
        <li class="mb-3">
          <strong>Load the report form</strong> by tapping the "Report an Incident or Hazard" button at least once. This
          caches the location list and other form data your device will need offline.
        </li>
        <li>
          <strong>Do not clear your browser data</strong> or app storage. The cached data is what allows the app to work
          offline.
        </li>
      </ol>
      <v-alert type="warning" variant="tonal" density="compact" class="mt-4">
        If you clear your browser cache or site data, you will need to repeat these steps with an internet connection
        before the app will work offline again.
      </v-alert>
    </v-card-text>
  </v-card>

  <!-- Submitting a Report While Offline -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Submitting a Report While Offline</h4>
    </v-card-item>
    <v-card-text>
      <p class="text-body-1 mb-4">When your device has no internet connection:</p>
      <ol class="ml-4">
        <li class="mb-2">Open the <strong>YG Safety Portal</strong> app from your home screen</li>
        <li class="mb-2">
          The app will detect that you are offline and show an <strong>"Offline"</strong> indicator
        </li>
        <li class="mb-2">Tap <strong>Report an Incident or Hazard Offline</strong></li>
        <li class="mb-2">
          Fill out the report form:
          <ul class="ml-4 mt-1">
            <li>Select the event type (Hazard, Incident, or No Loss Incident)</li>
            <li>Enter the date and time, urgency, location, and description</li>
            <li>Enter your email address and your supervisor's email address</li>
          </ul>
        </li>
        <li class="mb-2">Tap <strong>Submit</strong></li>
        <li>You will see a confirmation that your report has been saved</li>
      </ol>
      <p class="text-body-1 mt-4">
        Your report is now queued on your device. You do not need to keep the app open.
      </p>
      <p class="text-body-1 mt-2">
        If you are interrupted or the page refreshes, your form data is automatically saved as a draft and will be
        restored when you return.
      </p>
    </v-card-text>
  </v-card>

  <!-- What Happens When You Come Back Online -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">What Happens When You Come Back Online</h4>
    </v-card-item>
    <v-card-text>
      <p class="text-body-1 mb-3">
        When your device reconnects to the internet, the app will <strong>automatically upload</strong> any queued
        reports in the background. You do not need to open the app or take any action. Once the report is uploaded:
      </p>
      <ul class="ml-4 mb-4">
        <li class="mb-2">You and your supervisor will receive email notifications</li>
        <li>The report will appear in the system like any other submission</li>
      </ul>
      <p class="text-body-1">
        If the upload fails due to a brief connection interruption, the app will keep retrying automatically for up to 30
        days.
      </p>
    </v-card-text>
  </v-card>

  <!-- Differences from Online Reports -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Differences from Online Reports</h4>
    </v-card-item>
    <v-card-text>
      <p class="text-body-1 mb-3">
        The offline report form is simplified. A few features available in the regular online form are not available
        offline:
      </p>
      <ul class="ml-4">
        <li class="mb-2">
          <strong>Authentication</strong> &mdash; You do not need to be logged in. The report is identified by the email
          address you provide.
        </li>
        <li>
          <strong>On behalf of</strong> &mdash; Offline reports are always submitted by you. The "on behalf of" option is
          not available.
        </li>
      </ul>
    </v-card-text>
  </v-card>

  <!-- Troubleshooting -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Troubleshooting</h4>
    </v-card-item>
    <v-card-text>
      <h5 class="text-subtitle-1 font-weight-bold mb-2">The app doesn't load when I'm offline</h5>
      <ul class="ml-4 mb-5">
        <li class="mb-2">
          Make sure you installed the app from the browser (see installation steps above) and opened it at least once
          while online.
        </li>
        <li>
          If you recently cleared your browser cache or site data, you will need to revisit the site while online to
          re-cache the app.
        </li>
      </ul>

      <h5 class="text-subtitle-1 font-weight-bold mb-2">My report seems stuck / never uploaded</h5>
      <ul class="ml-4 mb-5">
        <li class="mb-2">
          Open the app while connected to the internet. The upload will be triggered automatically.
        </li>
        <li>
          If the report still doesn't appear in the system after reconnecting, submit a new report online and contact
          your administrator.
        </li>
      </ul>

      <h5 class="text-subtitle-1 font-weight-bold mb-2">I can't find the install option</h5>
      <ul class="ml-4 mb-5">
        <li class="mb-2">
          <strong>iPhone</strong>: You must use Safari. Other browsers on iOS do not support web app installation.
        </li>
        <li class="mb-2">
          <strong>Android</strong>: You must use Chrome. Make sure you are not in incognito/private mode.
        </li>
        <li>
          <strong>Desktop</strong>: Make sure you are using Chrome or Edge. Firefox does not support installing web apps.
        </li>
      </ul>

      <h5 class="text-subtitle-1 font-weight-bold mb-2">The app says I'm offline but I have internet</h5>
      <ul class="ml-4">
        <li class="mb-2">
          Try closing and reopening the app. The app checks server reachability periodically, and it may take up to 30
          seconds to detect that connectivity has been restored.
        </li>
        <li>
          If the problem persists, your network may be blocking access to the server (for example, a captive Wi-Fi portal
          that requires sign-in).
        </li>
      </ul>
    </v-card-text>
  </v-card>

  <!-- Permissions and Requirements -->
  <v-card class="default mb-6">
    <v-card-item class="py-4 px-6 mb-2 bg-sun">
      <h4 class="text-h6">Permissions and Requirements</h4>
    </v-card-item>
    <v-card-text>
      <ul class="ml-4">
        <li class="mb-3">
          <strong>Storage</strong> &mdash; The app stores cached files and queued reports on your device. No special
          permissions are required, but do not clear site data while reports are pending.
        </li>
        <li class="mb-3">
          <strong>Network</strong> &mdash; No special network permissions are needed. The app works on Wi-Fi, cellular,
          or any internet connection.
        </li>
        <li class="mb-3">
          <strong>Notifications</strong> &mdash; The app does not send push notifications. All status updates are sent
          via email once the report is uploaded.
        </li>
        <li>
          <strong>Battery / Background</strong> &mdash; On most devices the queued report will upload when you next use
          the browser or open the app, even if the app is not actively open. Some Android devices with aggressive battery
          optimization may delay this &mdash; if you suspect a report is stuck, open the app briefly while connected.
        </li>
      </ul>
    </v-card-text>
  </v-card>

  <div class="d-flex flex-wrap">
    <v-btn color="primary" to="/" class="mr-5 mb-0">Go back home</v-btn>
  </div>
</template>

<script setup></script>
