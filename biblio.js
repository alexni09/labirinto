class Biblio {
	static rnd(min, max) {
		if (max !== undefined) return Math.floor(Math.random() * (max - min + 1) ) + min;   // se a chamada desta função ocorrer com dois parâmetros
		else return Math.floor(Math.random() * min ) + 1;   // se a chamada da função ocorrer com um parâmetro
		// repare que rnd(6) == rnd(1,6), etc.
	}
}