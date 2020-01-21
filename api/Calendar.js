import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { CalendarConstants } from '../constants/CONSTANTS'

import _ from "lodash"

async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendars = calendars.filter(
    each => each.source.name === 'Default'
  );
  return defaultCalendars[0].source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: CalendarConstants.name}; 
  const newCalendarID = await Calendar.createCalendarAsync({
    title: CalendarConstants.name,
    color: CalendarConstants.color,
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: CalendarConstants.name,
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  
  return newCalendarID
}

async function removeJustLeaguesCalendars() {
    
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status != 'granted') {
        return false
    }

    const calendars = await Calendar.getCalendarsAsync();

    calendars.forEach(calendar => {

        if (calendar.name == CalendarConstants.name){

            Calendar.deleteCalendarAsync(calendar.id)
        } 
    })
}

export async function addEventToCalendar(eventInfo, {alarms}, callback){


    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status != 'granted') {
        return false
    }

    const calendars = await Calendar.getCalendarsAsync();

    let justLeaguesCalendar = _.find(calendars, {name: CalendarConstants.name})

    let calendarID;

    if (!justLeaguesCalendar){
        calendarID = await createCalendar()
    } else {
        calendarID = justLeaguesCalendar.id
    }

    await Calendar.createEventAsync(calendarID, {
        alarms: alarms ? alarms.map(alarm => ({ method: Calendar.AlarmMethod.ALERT , ...alarm}) ) : [],
        ...eventInfo,
        /* startDate: Date.now(),
        endDate: Date.now(),
        allDay: false,
        location: "Nick sports",
        notes: "jajajaj perdràs",
        //alarms (Array<Alarm>)
        //recurrenceRule (RecurrenceRule)
        //availability (string)
        timeZone: Localization.timezone,
        //endTimeZone (string) -- (Android only)
        //url (string) -- (iOS only)
        //organizerEmail (string) -- (Android only)
        //accessLevel (string) -- (Android only)
        //guestsCanModify (boolean) -- (Android only)
        //guestsCanInviteOthers (boolean) -- (Android only)
        //guestsCanSeeGuests (boolean) -- (Android only) */
    })
}