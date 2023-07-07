<script>
	let count = 0;
	let test = 0;
	$: console.log({count})
	$: console.log({test})
	// 	$: {
	// 	console.log(`the count is ${count}`);
	// 	console.log(`this will also be logged whenever count changes`);
	// }

	function handleClick() {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
	<br>
	Test {test}
	
</button>

