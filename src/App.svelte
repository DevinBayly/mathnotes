<script>
import {performUpload,performGet,brandNew} from "./drive_code.js"

</script>
  <div>
    <p>Drive API Quickstart</p>

    <!--Add buttons to initiate auth sequence and sign out-->
    <button id="authorize_button" style="display: none;">Authorize</button>
    <button id="signout_button" style="display: none;">Sign Out</button>

    <pre id="content" style="white-space: pre-wrap;"></pre>
    <div id="pdfcontainer">
      <canvas id="the-canvas"></canvas>
    </div>
    <canvas id="canvas"></canvas>

  </div>