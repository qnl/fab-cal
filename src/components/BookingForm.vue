<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn elevation="1" color="primary" v-bind="attrs" v-on="on">
        Reserve
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Reserve a Tool</v-card-title>
      <v-card-text>
        <v-form v-model="isValid">
          <v-container>
            <v-row>
              <v-col cols="9">
                <v-text-field
                  v-model="name"
                  label="Name"
                  :rules="nameValidation"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="selectedTool"
                  :items="tools.map(t => t.name)"
                  label="Tool"
                  :rules="toolValidation"
                >
                </v-select>
              </v-col>
              <v-col cols="12">
                <time-field
                  v-model="start"
                  label="Start"
                  :format="format"
                ></time-field>
              </v-col>
              <v-col cols="12">
                <time-field
                  v-model="end"
                  label="End"
                  :format="format"
                ></time-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="comments"
                  outlined
                  rows="3"
                  label="Comments"
                >
                </v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
        <v-btn color="blue darken-1" :disabled="!isValid" text @click="save()"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment';
import TimeField from '@/components/TimeField.vue';

export default {
  name: 'BookingForm',
  components: {
    TimeField
  },
  props: {
    tools: Array
  },
  data: () => ({
    dialog: false,
    format: 'YYYY-MM-DDTHH:mm:ss',
    start: moment().format('YYYY-MM-DDTHH:mm:ss'),
    end: moment()
      .add(15, 'minutes')
      .format('YYYY-MM-DDTHH:mm:ss'),
    name: '',
    comments: '',
    selectedTool: null,
    isValid: false,
    nameValidation: [value => !!value || 'Name is required.'],
    toolValidation: [value => !!value || 'You must select a tool.']
  }),
  methods: {
    save() {
      this.dialog = false;

      const selected = this.tools.filter(t => t.name === this.selectedTool);

      const eventData = {
        start: {
          dateTime: this.start,
          timeZone: 'America/Los_Angeles'
        },
        end: {
          dateTime: this.end,
          timeZone: 'America/Los_Angeles'
        },
        colorId: `${selected[0].colorId}`,
        summary: `${this.selectedTool} - [${this.name}]`,
        description: this.comments
      };
      this.$emit('save', eventData);
    }
  },
  watch: {
    start() {
      const startMoment = moment(this.start, this.format);
      const endMoment = moment(this.end, this.format);

      if (!startMoment.isBefore(endMoment)) {
        startMoment.add(15, 'minutes');
        this.end = startMoment.format(this.format);
      }
    },
    end() {
      const startMoment = moment(this.start, this.format);
      const endMoment = moment(this.end, this.format);

      if (!startMoment.isBefore(endMoment)) {
        this.start = endMoment.subtract(15, 'minutes').format(this.format);
      }
    }
  }
};
</script>
