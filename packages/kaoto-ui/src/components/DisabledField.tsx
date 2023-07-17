import { connectField } from 'uniforms';

export type DisabledFieldProps = {
  label: string;
  labelIcon: JSX.Element | undefined;
};

function DisconnectedDisabledField(props: DisabledFieldProps) {
  return (
    <div className="pf-u-disabled-color-100 pf-u-background-color-200">
      {props.label} {props.labelIcon}
    </div>
  );
}

export const DisabledField = connectField<DisabledFieldProps>(DisconnectedDisabledField);
