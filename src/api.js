import axios from 'axios';
import moment from 'moment';

const { auth } = require('google-auth-library');
const keys = require('@/cal-data.json');

export const calendar = {
  async getAuthHeaders() {
    const client = auth.fromJSON(keys);
    client.scopes = ['https://www.googleapis.com/auth/calendar'];

    const headers = await client.getRequestHeaders();

    return new axios.create({
      baseURL: 'https://www.googleapis.com/calendar/v3/',
      headers: headers
    });
  },
  async getCalendar(session, calId) {
    const resp = await session.get(`/calendars/${calId}`);
    return resp.data;
  },
  async getEvents(session, calId) {
    const resp = await session.get(`/calendars/${calId}/events/`);

    const format = 'YYYY-MM-DDTHH:mm:ss';

    const events = resp.data.items.map(event => ({
      name: event.summary,
      start: moment(event.start.dateTime).format(format),
      end: moment(event.end.dateTime).format(format),
      colorId: event.colorId
    }));

    return events;
  },
  async addEvent(session, calId, eventData) {
    const resp = await session.post(`/calendars/${calId}/events`, eventData);
    return resp.data;
  },
  async getColors(session) {
    const resp = await session.get('/colors');
    return resp.data;
  }
};
