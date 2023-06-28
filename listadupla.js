/*
	Lista de pares ordenados (x,y)
*/
class ListaDupla {
	lista = [];
	static distanciaEuclides(p1,p2,p3,p4) {
		var x1, x2, y1, y2;
		if ((p4 === undefined) && (p3 === undefined)) {
			x1 = p1[0]; y1 = p1[1]; x2 = p2[0]; y2 = p2[1];
		} else {
			x1 = p1; y1 = p2; x2 = p3; y2 = p4;
		}
		return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
	}
	existe(x,y) {
		for (let i = 0; i < this.lista.length; i++)
			if ((this.lista[i][0] == x) && (this.lista[i][1] == y)) return true;
		return false;
	}
	inclui(x,y) {
		if (this.existe(x,y)) return false;
		var ar = new Array(2);
		ar[0] = x;
		ar[1] = y;
		this.lista.push(ar);
		return true;
	}
	qtd() {
		return this.lista.length;
	}
	remove(x,y) {
		for (let i = 0; i < this.lista.length; i++)
			if ((this.lista[i][0] == x) && (this.lista[i][1] == y)) {
				this.lista.splice(i,1);
				return true;
			}
		return false;
	}
	rnd() {
		var qtd = this.lista.length;
		if (qtd > 0) return this.lista[Biblio.rnd(0,qtd-1)];
		else return undefined;
	}
	toString() {
		var st = "";
		for (let i = 0; i < this.lista.length; i++) st+= "(" + this.lista[i][0] + "," + this.lista[i][1] + ")";
		return st;
	}
}