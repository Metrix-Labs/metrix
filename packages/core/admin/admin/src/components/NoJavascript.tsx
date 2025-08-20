const styles = `
.metrix--root {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: #fff;
}

.metrix--no-js {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-family: helvetica, arial, sans-serif;
}
`;

/**
 * @internal
 *
 * @description this belongs to our default document that we render.
 */
const NoJavascript = () => {
  return (
    <noscript>
      <div className="metrix--root">
        <div className="metrix--no-js">
          <style type="text/css">{styles}</style>
          <h1>JavaScript disabled</h1>
          <p>
            Please <a href="https://www.enable-javascript.com/">enable JavaScript</a> in your
            browser and reload the page to proceed.
          </p>
        </div>
      </div>
    </noscript>
  );
};

export { NoJavascript };
