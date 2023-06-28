class Labirinto {
	/*		utilizadas no construtor		*/
	minimoX = 11;		// tamanho máximo da grade externa (valores absolutos)
	minimoY = 11;		// obs1: valores menores do que 11 arriscam espaços em branco em bordas
						// obs2: tais números tem que ser ímpares
	tag;				// nome deste objeto
	grade = [];			// a grade total
	maxX;				// dimensões totais da grade (valores absolutos)
	maxY;
	maxTentativas;		// máximo de tentativas de preencimento do labirinto
	/*		utilizadas em geraLabirinto()		*/
	offset = 35; 						// % máxima de afastamento do centro (máximo teórico < 50%, devido às bordas)
	lista;								// lista temporária de espaços vazios os quais possuam ao menos uma parede adjacente possível de esburacamento, teoricamente
										// obs: é uma lista de pares ordenados (x,y) da classe ListaDupla
	listaExt;							// lista de espaços vazios a 2 espaços de distância de algum limite da grade
										// obs: é uma lista de pares ordenados (x,y) da classe ListaDupla
	/*		geraLabirinto(), parte dois			*/
	numeroMagicoDistancia = 0.97;		// multiplicador inicial sobre a distância Euclidiana máxima; deve ser quase 1
	minNumeroMagicoDistancia = 0.3;		// multiplicador mínimo; implementado como válvula de segurança
	qtdRepeticoes = 100;				// quantas vezes tentar até decrementar numeroMagicoDistancia
	decremento = 0.005;					// valor a decrementar	
	qtdMaxRepeticoes = 60000;			// máximo absoluto de tentativas de encontrar xy1 e xy2; obs: deve ser múltiplo de qtdRepeticoes
	xy1;								// os dois elementos da lista acima, já escolhidos; e posteriormente os pontos de entrada e de saída, respectivamente
	xy2;								// obs: são pares ordenados (x,y)
	/*		utilizadas em geraHTML() e mover()		*/
	x;						// posição do boneco
	y;
	inicial = false;		// se é o primeiro movimento
	passos = -1;			// quantidade de passos até o próximo som
	beep() {
		document.getElementById("beep").play();
	}
	constructor(tag,qtdX,qtdY,tentativas) {
		this.tag = tag;
		if (qtdX < this.minimoX) this.maxX = this.minimoX;
		else if (qtdX % 2 == 0) this.maxX = qtdX + 1;
		else this.maxX = qtdX;
		if (qtdY < this.minimoY) this.maxY = this.minimoY;
		else if (qtdY % 2 == 0) this.maxY = qtdY + 1;
		else this.maxY = qtdY;
		var distX = Math.floor(this.maxX * this.offset / 100);
		var x = Math.floor(this.maxX / 2 + Biblio.rnd(-1*distX,distX));
		var distY = Math.floor(this.maxY * this.offset / 100);
		var y = Math.floor(this.maxY / 2 + Biblio.rnd(-1*distY,distY));
		for (let j = 0; j < this.maxY; j++) {
			var ar = new Array(this.maxX).fill(true);
			this.grade.push(ar);
		}
		this.grade[y][x] = false;
		this.lista = new ListaDupla();
		this.lista.inclui(x,y);
		if (tentativas === undefined) this.maxTentativas = 15 * this.maxX * this.maxY;
		else this.maxTentativas = tentativas;
		this.listaExt = new ListaDupla();
	}
	geraHTML() {
		var tag = this.tag;
		var objTable = document.createElement("table");
		objTable.id = tag + "_tabela";
		objTable.style = "border-collapse:collapse; border:0px; padding:0px; margin:0px;";
		var objTB = document.createElement("tbody");
		for (let j = 0; j < this.maxY; j++) {
			var objTR = document.createElement("tr");
			for (let i = 0; i < this.maxX; i++) {
				var objTD = document.createElement("td");
				objTD.innerText = " ";
				if (this.grade[j][i]) objTD.style = "height:20px; width:15px; text-align:center; background-color:black; border:0px; padding:0px; margin:0px;";
				else objTD.style = "height:20px; width:15px; text-align:center; background-color:white; border:0px; padding:0px; margin:0px;";
				var objDiv = document.createElement("div");
				objDiv.id = tag + "_div_" + i + "_" + j;
				objDiv.style = "position:relative; border:0px; padding:0px; margin:0px;";
				objTD.appendChild(objDiv);
				objTR.appendChild(objTD);
			}
			objTB.appendChild(objTR);
		}
		objTable.appendChild(objTB);
		document.getElementById(tag).appendChild(objTable);
		// boneco:
		var objImg = document.createElement("img");
		objImg.id = tag + "_boneco";
		objImg.tabIndex = "-123";
		objImg.src = "images/andando.gif";
		objImg.width = "12";
		objImg.height = "15";
		objImg.style = "border:0px; padding:0px; margin:0px;";
		objImg.onkeydown = function() { eval(tag + ".mover(event)") };
		document.getElementById(tag + "_div_" + this.xy1[0] + "_" + this.xy1[1]).appendChild(objImg);
		this.x = this.xy1[0];
		this.y = this.xy1[1];
		this.inicial = true;
		// brancos:
		for (let j = 1; j < this.maxY - 1; j++) 
			for (let i = 1; i < this.maxX - 1; i++)
				if ((!this.grade[j][i]) && (i != this.x) && (j != this.y)) {
					var objImg2 = document.createElement("img");
					objImg2.src = "images/branco12_15.png";
					objImg2.width = "12";
					objImg2.height = "15";
					objImg2.style = "border:0px; padding:0px; margin:0px;";
					document.getElementById(tag + "_div_" + i + "_" + j).appendChild(objImg2);
				}
		// pretos:
		var objImg3 = document.createElement("img");
		objImg3.src = "images/preto12_15.png";
		objImg3.width = "12";
		objImg3.height = "15";
		objImg3.style = "border:0px; padding:0px; margin:0px;";
		var objImg4 = objImg3.cloneNode(true);
		document.getElementById(tag + "_div_1_1").appendChild(objImg3);
		document.getElementById(tag + "_div_" + (this.maxX - 2).toString() + "_1").appendChild(objImg4);
		// a exibir som
		this.passos = Biblio.rnd(9,19);
		// som de abertura
		document.getElementById("chime").play();
		// boneco
		document.getElementById(tag + "_boneco").focus();
	}
	geraLabirinto() {
		// preenchimento do labirinto (propriamente dito)
		var tentativas = 0;
		while ((tentativas < this.maxTentativas) && (this.lista.qtd() > 0)) {
			var xy = this.lista.rnd();
			var x = xy[0];
			var y = xy[1];
			if ((x == 2) || (y == 2) || (x == this.maxX - 3) || (y == this.maxY - 3)) this.listaExt.inclui(x,y);
			if (this.semSaida(x,y)) this.lista.remove(x,y);
			else {
				var dir = Biblio.rnd(4);
				var possiv;
				switch(dir) {	// observa-se que mesmo que haja uma ou mais direções possíveis, pode ser escolhida uma direção impossível
					case 1: 
						possiv = this.possivel(x,y-1,dir);
						if (possiv) {
							this.lista.inclui(x,y-1);
							this.grade[y-1][x] = false;
						} 
						break; 
					case 2: 
						possiv = this.possivel(x+1,y,dir); 
						if (possiv) {
							this.lista.inclui(x+1,y);
							this.grade[y][x+1] = false;
						} 
						break;
					case 3: 
						possiv = this.possivel(x,y+1,dir); 
						if (possiv) {
							this.lista.inclui(x,y+1);
							this.grade[y+1][x] = false;
						} 
						break;
					case 4: 
						possiv = this.possivel(x-1,y,dir); 
						if (possiv) {
							this.lista.inclui(x-1,y);
							this.grade[y][x-1] = false;
						} 
						break; 
					default: possiv = false;
				}
			}
			tentativas++;
		}
		// pontos de entrada e de saída:
		var xy1, xy2;
		// distância mínima permitida entre dois elementos da lista de pares ordenados:
		var minExt = Math.floor(this.numeroMagicoDistancia*ListaDupla.distanciaEuclides(2,2,this.maxX-2,this.maxY-2));
		var tentativas2 = 1;
		do {
			xy1 = this.listaExt.rnd();
			xy2 = this.listaExt.rnd();
			if ((tentativas2 > 0) && (tentativas2 % this.qtdRepeticoes)) {		// refazer distância mínima:
				this.numeroMagicoDistancia -= this.decremento;
				minExt = Math.floor(this.numeroMagicoDistancia*ListaDupla.distanciaEuclides(2,2,this.maxX-2,this.maxY-2));
			}				
			tentativas2++;
		} while ((ListaDupla.distanciaEuclides(xy1,xy2) < minExt) 
			  && (tentativas2 < this.qtdMaxRepeticoes) 
			  && (this.numeroMagicoDistancia >= this.minNumeroMagicoDistancia));
		if (xy1[0] == 2) xy1[0]--;
		else if (xy1[0] == this.maxX-3) xy1[0]++;
		else if (xy1[1] == 2) xy1[1]--;
		else if (xy1[1] == this.maxY-3) xy1[1]++;
		if (xy2[0] == 2) xy2[0]--;
		else if (xy2[0] == this.maxX-3) xy2[0]++;
		else if (xy2[1] == 2) xy2[1]--;
		else if (xy2[1] == this.maxY-3) xy2[1]++;
		this.xy1 = xy1;
		this.xy2 = xy2;
		this.grade[this.xy1[1]][this.xy1[0]] = false; 
		this.grade[this.xy2[1]][this.xy2[0]] = false; 
		// contorno:
		for (let i = 0; i < this.maxX; i++) {
			this.grade[0][i] = false;
			this.grade[this.maxY-1][i] = false;
		}
		for (let i = 1; i < this.maxY - 1; i++) {
			this.grade[i][0] = false;
			this.grade[i][this.maxX - 1] = false;
		}
	}
	listaExterna() {	// rotina auxiliar utilizada para teste
		return this.listaExt.toString();
	}
	mover(ev) {
		var tag = this.tag;
		var x2,y2;
		if ((ev.keyCode < 37) || (ev.keyCode > 40)) return false;
		//	Prepara o movimento:
		switch (ev.keyCode) {
			case 37: 	// esquerda
				if (this.x <= 1) { this.beep(); return false }
				if (this.grade[this.y][this.x - 1]) { this.beep(); return false }
				x2 = this.x - 1;
				y2 = this.y;
				break;
			case 38:	// acima
				if (this.y <= 1) { this.beep(); return false }
				if (this.grade[this.y - 1][this.x]) { this.beep(); return false }
				x2 = this.x;
				y2 = this.y - 1;
				break;
			case 39:	// direita
				if (this.x >= this.maxX - 2) { this.beep(); return false }
				if (this.grade[this.y][this.x + 1]) { this.beep(); return false }
				x2 = this.x + 1;
				y2 = this.y;
				break;
			case 40:	// abaixo
				if (this.y >= this.maxY - 2) { this.beep(); return false }
				if (this.grade[this.y + 1][this.x]) { this.beep(); return false }
				x2 = this.x;
				y2 = this.y + 1;
		}
		// efetua o movimento:
		var objImg = document.getElementById(tag + "_boneco");
		objImg.remove();
		var objDiv = document.getElementById(tag + "_div_" + this.x + "_" + this.y);
		if (objDiv.childNodes.length > 0) objDiv.removeChild(objDiv.childNodes[0]);
		var objImg2 = document.createElement("img");
		objImg2.src = "images/branco12_15.png";
		objImg2.width = "12";
		objImg2.height = "15";
		objImg2.style = "border:0px; padding:0px; margin:0px;";
		objDiv.appendChild(objImg2);
		var objDiv2 = document.getElementById(tag + "_div_" + x2 + "_" + y2);
		if (objDiv2.childNodes.length > 0) objDiv2.removeChild(objDiv2.childNodes[0]);
		objDiv2.appendChild(objImg);
		document.getElementById(tag + "_boneco").focus();
		if (this.inicial) {
			this.inicial = false;
			objDiv.parentNode.style = "height:20px; width:15px; text-align:center; background-color:222222; border:0px; padding:0px; margin:0px;";
			this.grade[this.y][this.x] = true;
			objImg2.src = "images/cinzaescuro12_15.png";
			document.getElementById("clonk").play();
		}
		// deixa pronto para o próximo movimento:
		this.x = x2;
		this.y = y2;
		// se ganhou:
		if ((this.xy2[0] == x2) && (this.xy2[1] == y2)) {
			document.getElementById(tag + "_boneco").onkeydown = undefined;
			var objExt = document.getElementById(tag + "_tabela");
			var topo = objExt.parentNode.offsetTop;
			var largura = objExt.clientWidth;
			var altura = objExt.clientHeight;
			var objH2 = document.createElement("h2");
			objH2.style = "position:absolute; text-align:center; height:90px; padding-top:60px; width:300px; background-color:yellow; color:black; opacity:0.9; z-index:100";
			objH2.style.top = Math.floor(altura/2-95+topo).toString();
			objH2.style.left = Math.floor(largura/2-142).toString();
			objH2.innerText = "Você ganhou!";
			document.body.appendChild(objH2);
			document.getElementById("explosion").play();
		} else {	// não ganhou...
			this.passos--;
			if (this.passos == 0) { document.getElementById("passos").play(); this.passos = Biblio.rnd(9,19) }
		}
		return true;
	}
	possivel(x,y,dir) {
		switch(dir) {
			case 1:		// para cima
				if (y <= 1) return false;
				if (!this.grade[y-1][x]) return false;
				if (!this.grade[y-1][x-1]) return false;
				if (!this.grade[y-1][x+1]) return false;
				if (!this.grade[y][x-1]) return false;
				if (!this.grade[y][x+1]) return false;
				return true;
			case 2:		// para direita
				if (x >= this.maxX - 2) return false;
				if (!this.grade[y][x+1]) return false;
				if (!this.grade[y-1][x+1]) return false;
				if (!this.grade[y+1][x+1]) return false;
				if (!this.grade[y-1][x]) return false;
				if (!this.grade[y+1][x]) return false;
				return true;
			case 3:		// para baixo
				if (y >= this.maxY - 2) return false;
				if (!this.grade[y+1][x]) return false;
				if (!this.grade[y+1][x-1]) return false;
				if (!this.grade[y+1][x+1]) return false;
				if (!this.grade[y][x-1]) return false;
				if (!this.grade[y][x+1]) return false;
				return true;
			case 4:		// para esquerda
				if (x <= 1) return false;
				if (!this.grade[y][x-1]) return false;
				if (!this.grade[y-1][x-1]) return false;
				if (!this.grade[y+1][x-1]) return false;
				if (!this.grade[y-1][x]) return false;
				if (!this.grade[y+1][x]) return false;
				return true;
			default:
				return false;
		}
	}
	semSaida(x,y) {
		var n = 4; 
		if ((y <= 1) || !this.possivel(x,y-1,1)) n--;
		if ((x <= 1) || !this.possivel(x-1,y,4)) n--;
		if ((y >= this.maxY - 2) || !this.possivel(x,y+1,3)) n--;
		if ((x >= this.maxX - 2) || !this.possivel(x+1,y,2)) n--;
		return !(n>0);
	}
}