import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import {
  events as initialEvents,
  venues as initialVenues,
  registrations as initialRegistrations,
  volunteers as initialVolunteers,
  notifications as initialNotifications,
  feedbacks as initialFeedbacks,
  type Event,
  type Venue,
  type Registration,
  type Volunteer,
  type Notification,
  type Feedback,
} from '@/data/mockData';

// Track seeded status across session
let isEventsSeeded = false;
let isVenuesSeeded = false;
let isRegistrationsSeeded = false;
let isVolunteersSeeded = false;
let isNotificationsSeeded = false;
let isFeedbacksSeeded = false;

// 1. Events Store
export function useEventsStore() {
  const [eventsList, setEventsList] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'events');

    // Real-time snapshot listener
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isEventsSeeded) {
          isEventsSeeded = true;
          // Seed initial events into Firestore
          try {
            for (const item of initialEvents) {
              await setDoc(doc(db, 'events', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'events');
          }
        } else if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => d.data() as Event);
          // Sort by date or id
          setEventsList(docs);
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'events');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addEvent = async (newEvent: Event) => {
    try {
      await setDoc(doc(db, 'events', newEvent.id), newEvent);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `events/${newEvent.id}`);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      await updateDoc(doc(db, 'events', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `events/${id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    }
  };

  return { events: eventsList, loading, addEvent, updateEvent, deleteEvent };
}

// 2. Venues Store
export function useVenuesStore() {
  const [venuesList, setVenuesList] = useState<Venue[]>(initialVenues);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'venues');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isVenuesSeeded) {
          isVenuesSeeded = true;
          try {
            for (const item of initialVenues) {
              await setDoc(doc(db, 'venues', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'venues');
          }
        } else if (!snapshot.empty) {
          setVenuesList(snapshot.docs.map((d) => d.data() as Venue));
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'venues');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addVenue = async (newVenue: Venue) => {
    try {
      await setDoc(doc(db, 'venues', newVenue.id), newVenue);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `venues/${newVenue.id}`);
    }
  };

  const updateVenue = async (id: string, updates: Partial<Venue>) => {
    try {
      await updateDoc(doc(db, 'venues', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `venues/${id}`);
    }
  };

  const deleteVenue = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'venues', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `venues/${id}`);
    }
  };

  return { venues: venuesList, loading, addVenue, updateVenue, deleteVenue };
}

// 3. Registrations Store
export function useRegistrationsStore() {
  const [regs, setRegs] = useState<Registration[]>(initialRegistrations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'registrations');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isRegistrationsSeeded) {
          isRegistrationsSeeded = true;
          try {
            for (const item of initialRegistrations) {
              await setDoc(doc(db, 'registrations', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'registrations');
          }
        } else if (!snapshot.empty) {
          setRegs(snapshot.docs.map((d) => d.data() as Registration));
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const registerUser = async (newReg: Omit<Registration, 'id'>) => {
    const regId = `r_${Date.now()}`;
    const reg: Registration = {
      ...newReg,
      id: regId,
    };
    try {
      await setDoc(doc(db, 'registrations', regId), reg);
      return reg;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `registrations/${regId}`);
      return reg;
    }
  };

  const updateRegistrationStatus = async (id: string, status: Registration['status']) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registrations/${id}`);
    }
  };

  return { registrations: regs, loading, registerUser, updateRegistrationStatus };
}

// 4. Volunteers Store
export function useVolunteersStore() {
  const [vols, setVols] = useState<Volunteer[]>(initialVolunteers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'volunteers');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isVolunteersSeeded) {
          isVolunteersSeeded = true;
          try {
            for (const item of initialVolunteers) {
              await setDoc(doc(db, 'volunteers', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'volunteers');
          }
        } else if (!snapshot.empty) {
          setVols(snapshot.docs.map((d) => d.data() as Volunteer));
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'volunteers');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addVolunteer = async (newVol: Omit<Volunteer, 'id'>) => {
    const volId = `vo_${Date.now()}`;
    const vol: Volunteer = {
      ...newVol,
      id: volId,
    };
    try {
      await setDoc(doc(db, 'volunteers', volId), vol);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `volunteers/${volId}`);
    }
  };

  const updateVolunteerStatus = async (id: string, status: Volunteer['status']) => {
    try {
      await updateDoc(doc(db, 'volunteers', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `volunteers/${id}`);
    }
  };

  const removeVolunteer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'volunteers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `volunteers/${id}`);
    }
  };

  return { volunteers: vols, loading, addVolunteer, updateVolunteerStatus, removeVolunteer };
}

// 5. Notifications Store
export function useNotificationsStore() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'notifications');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isNotificationsSeeded) {
          isNotificationsSeeded = true;
          try {
            for (const item of initialNotifications) {
              await setDoc(doc(db, 'notifications', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'notifications');
          }
        } else if (!snapshot.empty) {
          setNotifs(snapshot.docs.map((d) => d.data() as Notification));
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const markAllRead = async () => {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      for (const d of snap.docs) {
        await updateDoc(doc(db, 'notifications', d.id), { read: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'notifications');
    }
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const notifId = `n_${Date.now()}`;
    const notif: Notification = {
      ...n,
      id: notifId,
      time: 'Just now',
      read: false,
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), notif);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
    }
  };

  return { notifications: notifs, loading, markAllRead, addNotification };
}

// 6. Feedbacks Store
export function useFeedbacksStore() {
  const [fbs, setFbs] = useState<Feedback[]>(initialFeedbacks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'feedbacks');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !isFeedbacksSeeded) {
          isFeedbacksSeeded = true;
          try {
            for (const item of initialFeedbacks) {
              await setDoc(doc(db, 'feedbacks', item.id), item);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'feedbacks');
          }
        } else if (!snapshot.empty) {
          setFbs(snapshot.docs.map((d) => d.data() as Feedback));
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'feedbacks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addFeedback = async (fb: Omit<Feedback, 'id' | 'submittedAt'>) => {
    const fbId = `f_${Date.now()}`;
    const newFb: Feedback = {
      ...fb,
      id: fbId,
      submittedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'feedbacks', fbId), newFb);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `feedbacks/${fbId}`);
    }
  };

  return { feedbacks: fbs, loading, addFeedback };
}
