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
            Your submission has been received and you will receive email notifications regarding the status of this
            submission.
          </p>
          <p class="text-body-1 mb-5 mt-5">
            At any time, you can also view your previously submitted reports on this site.
          </p>

          <div class="d-flex flex-wrap">
            <v-btn color="primary" to="/" class="mr-5 mb-0">Go back home</v-btn>
            <v-btn color="warning" to="/report-an-incident" variant="tonal" class="mb-0">Submit another report</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </section>
  </v-form>
</template>

<script setup></script>
