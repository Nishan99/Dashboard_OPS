import { useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';
import {
  seedPeople, seedProjects, seedTasks, seedTimeEntries,
  seedMeetings, seedInvoices, seedActivity,
} from '../data/seedData';

export function useSeedData() {
  const hasSeeded = useRef(false);
  const store = useStore();

  useEffect(() => {
    if (hasSeeded.current || store.people.length > 0) return;
    hasSeeded.current = true;

    useStore.setState({
      people: seedPeople,
      projects: seedProjects,
      tasks: seedTasks,
      timeEntries: seedTimeEntries,
      meetings: seedMeetings,
      invoices: seedInvoices,
      activity: seedActivity,
    });
  }, []);
}
