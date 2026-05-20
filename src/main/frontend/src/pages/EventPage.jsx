import React from 'react';
import EventCreated from '../components/EventCreated';
import EventLists from '../components/EventLists';

const EventPage = () => {
    return (
        <div>
            <EventCreated/>
            <EventLists/>
        </div>
    );
};

export default EventPage;