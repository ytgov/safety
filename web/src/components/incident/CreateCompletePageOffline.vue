<template>
  <h1 class="text-h4">Report Complete</h1>
  <!-- <p class="text-body-2">
    Personal information is collected under the Workers' Safety and Compensation Act, Section #, for the purposes of
    Incident investigation and corrective action. For further information, contant the Director of Health, Safety &
    Wellbeing at 867-332-5974
  </p> -->

  <v-form class="mt-6">
    <section>
      <v-card class="default">
        <v-card-item class="py-4 px-6 mb-2 bg-sun">
          <h4 class="text-h6">Thank you!</h4>
        </v-card-item>
        <v-card-text>
          <p class="text-body-1 mb-5 mt-5">
            Your report has been saved and will be submitted automatically when your device reconnects to the internet.
            Once submitted, you will receive email notifications regarding the status of this submission.
          </p>
          <p class="text-body-1 mb-5 mt-5">
            You can close this page. Your report will be uploaded in the background when connectivity is restored.
          </p>

          <div class="d-flex flex-wrap">
            <v-btn color="primary" to="/" class="mr-5 mb-0">Go back home</v-btn>
            <v-btn color="warning" to="/report-an-incident-offline" variant="tonal" class="mb-0"
              >Submit another report</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </section>
  </v-form>
</template>

<script setup></script>
