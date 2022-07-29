interface IConsole {
    handleCloseConsole: () => void;
}
declare const Console: (props: IConsole) => JSX.Element;
export { Console };
