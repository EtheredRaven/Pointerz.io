<script>
  import { onMount } from "svelte";
  import { userModel } from "../../misc/store";

  function isLoggedIn() {
    return $userModel;
  }

  if (!isLoggedIn()) {
    // Redirect to main page if not logged in
    window.location.href = "/";
  }
</script>

<slot />
