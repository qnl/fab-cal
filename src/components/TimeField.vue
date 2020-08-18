<template>
  <v-container class="py-0">
    <v-row>
      <v-col class="pa-0" cols="6">
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="selectedDate"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="selectedDate"
              :label="label"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="selectedDate" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
            <v-btn text color="primary" @click="setDate(selectedDate)"
              >Ok</v-btn
            >
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="6" class="py-0">
        <v-select
          :items="times"
          v-model="selectedTime"
          required
          single-line
          @input="setTime()"
        >
        </v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment';

export default {
  name: 'TimeField',
  props: {
    label: String,
    value: String,
    format: String
  },
  data() {
    return {
      menu: false,
      datetime: this.roundDateTime(this.value),
      times: [...Array(24 * 4)].map((d, i) => {
        return moment({
          hour: Math.floor(i / 4),
          minute: 15 * (i % 4)
        }).format('hh:mm a');
      })
    };
  },
  computed: {
    selectedDate: {
      get() {
        return this.roundDateTime(this.datetime).slice(0, 10);
      },
      set(newValue) {
        const newDateTime = moment(this.datetime, this.format);
        const newDate = moment(newValue, 'YYYY-MM-DD');

        newDateTime.year(newDate.year());
        newDateTime.month(newDate.month());
        newDateTime.date(newDate.date());

        this.datetime = newDateTime.format(this.format);
      }
    },
    selectedTime: {
      get() {
        const time = moment(this.roundDateTime(this.datetime), this.format);

        return time.format('hh:mm a');
      },
      set(newValue) {
        const newDateTime = moment(this.datetime, this.format);
        const newTime = moment(newValue, 'hh:mm a');

        newDateTime.hour(newTime.hour());
        newDateTime.minute(newTime.minute());
        newDateTime.second(0);

        this.datetime = newDateTime.format(this.format);
      }
    }
  },
  methods: {
    roundDateTime(dateTimeIn) {
      const datetime = moment(dateTimeIn, this.format);
      const difference =
        Math.ceil(datetime.minute() / 15) * 15 - datetime.minute();
      datetime.add(difference, 'minutes');
      return datetime.format(this.format);
    },
    setTime() {
      this.$emit('input', this.datetime);
    },
    setDate(date) {
      this.$refs.menu.save(date);
      this.$emit('input', this.datetime);
    }
  },
  watch: {
    value() {
      this.datetime = this.roundDateTime(this.value);
    }
  }
};
</script>
