<script lang="ts">
let count = $state(0)

function increment(){
    count++
}

function decrement() {
    count--
}
</script>

<div>{count}</div>
<button onclick={increment}>+</button>
<button onclick={decrement}>-</button>
