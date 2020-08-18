<template>
  <v-app>
    <v-container fill-height>
      <v-row>
        <v-col cols="12">
          <h1>QNL Fab Scheduling</h1>
        </v-col>
        <v-col cols="6">
          <booking-form :tools="tools" @save="postEvent($event)"></booking-form>
        </v-col>
        <v-spacer></v-spacer>
        <v-col class="text-right" cols="6">
          <v-btn text outlined class="mx-5" @click="goToToday()"> Today </v-btn>
          <v-btn text icon color="primary" @click="cal.prev()">
            <v-icon dark>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn text icon color="primary" @click="cal.next()">
            <v-icon dark>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12">
          <v-sheet :height="windowHeight - 180">
            <v-calendar
              ref="calendar"
              v-model="start"
              color="primary"
              :events="events"
              :event-color="getColor"
              type="week"
            >
              <template #day-body="{ date, week }">
              <div
                class="v-current-time"
                :class="{ first: date === week[0].date }"
                :style="{ top: nowLine }"
              ></div>
            </template>
            </v-calendar>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import moment from 'moment';
import { calendar } from '@/api';
import BookingForm from '@/components/BookingForm';

export default {
  name: 'App',
  components: {
    BookingForm
  },
  data: () => ({
    calId: 'bsmnhvn6fk21r6318k1qfa1rqc@group.calendar.google.com',
    ready: false,
    windowHeight: window.innerHeight,
    start: moment().format('YYYY-MM-DD'),
    tools: [
      'Raith',
      'Plassys',
      'Slichtech',
      'KJL',
      'Wirebonder',
      'Probe Station',
      'SEM',
      'AFM'
    ].map((d, i) => ({ name: d, colorId: i + 1 })),
    events: [],
    colors: []
  }),
  computed: {
    cal() {
      return this.ready ? this.$refs.calendar : null;
    },
    nowLine() {
      return this.cal? this.cal.timeToY(this.cal.times.now) + 'px': '-10px';
    }
  },
  async created() {
    this.session = await calendar.getAuthHeaders();

    const colors = await calendar.getColors(this.session);
    this.colors = Object.values(colors.event).map(c => c.background);

    const events = await calendar.getEvents(this.session, this.calId);
    this.events = events;
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.windowHeight = window.innerHeight
    });
    console.log(this.windowHeight);
    this.ready = true;
    this.scrollToTime();
    this.updateTime();
  },
  methods: {
    async postEvent(eventData) {
      const format = 'YYYY-MM-DDTHH:mm:ss';
      const event = await calendar.addEvent(
        this.session,
        this.calId,
        eventData
      );
      this.events.push({
        name: event.summary,
        start: moment(event.start.dateTime).format(format),
        end: moment(event.end.dateTime).format(format),
        colorId: event.colorId || 0
      });
    },
    getColor(event) {
      if (event.colorId && event.colorId <= this.colors.length)
        return this.colors[event.colorId - 1];
      else return 'primary';
    },
    goToToday() {
      this.start = moment().format('YYYY-MM-DD');
    },
    getCurrentTime () {
      return this.cal ? this.cal.times.now.hour * 60 + this.cal.times.now.minute : 0
    },
    scrollToTime () {
      const time = this.getCurrentTime()
      const first = Math.max(0, time - (time % 30) - 60)

      this.cal.scrollToTime(first)
    },
    updateTime () {
      setInterval(() => this.cal.updateTimes(), 60 * 1000)
    },
  }
};
</script>

<style scoped lang="scss">
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
</style>