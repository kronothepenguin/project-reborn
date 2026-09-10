<script lang="ts">
  let count = $state(0);

  function increment() {
    count++;
  }

  function decrement() {
    count--;
  }
</script>

<div class="m-2 mx-auto p-2">{count}</div>
<button onclick={increment}>+</button>
<button onclick={decrement}>-</button>
