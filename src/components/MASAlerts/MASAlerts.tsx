import React, { useEffect, useState } from 'react';
import { MASAlertToastGroup } from '@app/common';
import { AlertContext, AlertProps } from '@rhoas/app-services-ui-shared';

type TimeOut = {
  key: string | undefined;
  timeOut: ReturnType<typeof setTimeout> | undefined;
};

export const AlertProvider: React.FunctionComponent = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);
  const [timers, setTimers] = useState<TimeOut[]>([]);

  useEffect(() => {
    const timersKeys = timers.map((timer) => timer.key);
    const timeOuts = alerts
      .filter((alert) => !timersKeys.includes(alert?.id))
      .map((alert) => {
        const { id = '' } = alert;
        const timeOut: ReturnType<typeof setTimeout> = setTimeout(
          () => hideAlert(id),
          8000
        );
        return { key: alert.id, timeOut } as TimeOut;
      });
    setTimers([...timers, ...timeOuts]);
    return () =>
      timers.forEach((timer) => timer?.timeOut && clearTimeout(timer.timeOut));
  }, [alerts]);

  const createId = () => new Date().getTime();

  const hideAlert = (key: string | undefined) => {
    setAlerts((alerts) => [...alerts.filter((el) => el.id !== key)]);
    setTimers((timers) => [...timers.filter((timer) => timer.key === key)]);
  };

  const addAlert = (props: AlertProps) => {
    const id = createId().toString();
    setAlerts([...alerts, { ...props, id }]);
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      <MASAlertToastGroup alerts={alerts} onCloseAlert={hideAlert} />
      {children}
    </AlertContext.Provider>
  );
};
