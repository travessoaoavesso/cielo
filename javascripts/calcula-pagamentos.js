$(function() {

    //! moment.js locale configuration
    //! locale : brazilian portuguese (pt-br)
    //! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

	moment.locale('pt-br', {
        months : 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
        weekdays : 'Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado'.split('_'),
        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
        weekdaysMin : 'Dom_2ª_3ª_4ª_5ª_6ª_Sáb'.split('_'),
        longDateFormat : {
            LT : 'HH:mm',
            LTS : 'HH:mm:ss',
            L : 'DD/MM/YYYY',
            LL : 'D [de] MMMM [de] YYYY',
            LLL : 'D [de] MMMM [de] YYYY [às] HH:mm',
            LLLL : 'dddd, D [de] MMMM [de] YYYY [às] HH:mm'
        },
        calendar : {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : 'em %s',
            past : '%s atrás',
            s : 'poucos segundos',
            m : 'um minuto',
            mm : '%d minutos',
            h : 'uma hora',
            hh : '%d horas',
            d : 'um dia',
            dd : '%d dias',
            M : 'um mês',
            MM : '%d meses',
            y : 'um ano',
            yy : '%d anos'
        },
        ordinalParse: /\d{1,2}º/,
        ordinal : '%dº'
    });

    $("#botao-calcular").click(calcular);
    $("#botao-limpar").click(limpar);
    $("#tipo-cartao").change(habilitarParcelamento);
    $("#botao-limpar").prop( "disabled", true );
    $("#tabela-resultados").hide();
});

function calcular(){
	var dataVenda = moment($("#data-venda").val());
	var valorVenda = $("#valor-venda").val();
	
	if(validarCamposObrigatorios(dataVenda, valorVenda)){
	
		var tipoCartao = $("#tipo-cartao").val();
		var numeroParcelas = parseInt(obterNumeroParcelas(tipoCartao));
		var datas = calcularDatas(dataVenda, tipoCartao, numeroParcelas);
		var valores = calcularValores(valorVenda, tipoCartao, bandeiraCartao, numeroParcelas);

		montarTabelaResultados(numeroParcelas, datas, valores);

		desabilitarCamposAposCalculo();
		$("#botao-limpar").focus();
		$("#tabela-resultados").show();
	}

}

function desabilitarCamposAposCalculo(){
	$("#data-venda").prop( "disabled", true );
	$("#valor-venda").prop( "disabled", true );
	$("#tipo-cartao").prop( "disabled", true );
	$("#numero-parcelas").prop( "disabled", true );
	$("#botao-calcular").prop( "disabled", true );
	$("#botao-limpar").prop( "disabled", false );
}

function habilitarCamposParaCalculo(){
	$("#data-venda").prop( "disabled", false );
	$("#valor-venda").prop( "disabled", false );
	$("#tipo-cartao").prop( "disabled", false );
	$("#numero-parcelas").prop( "disabled", false );
	$("#botao-calcular").prop( "disabled", false );
	$("#botao-limpar").prop( "disabled", true );
}

function obterNumeroParcelas(tipoCartao){
	if(tipoCartao == 2){
		return 1;
	} else return $("#numero-parcelas").val();
}
 
function calcularDatas(dataVenda, tipoCartao, numeroParcelas) {
	var datas;
	alert("CalcularDatasNovo");
	datas = calcularDatasPagamento(dataVenda, numeroParcelas);
	return datas;
}

function calcularDatasPagamento(dataVenda, numeroParcelas){
	var datasPagamento = new Array();
	var datasParcelas = calcularDatasParcelas(dataVenda, numeroParcelas);
	for(i=0;i<datasParcelas.length;i++){
		var dataPagamento = datasParcelas[i];
		var diaDaSemana = dataPagamento.day();
		while(!ehDiaUtil(diaDaSemana)){
			dataPagamento.add(1, 'days');
			diaDaSemana = dataPagamento.day();
		}
		datasPagamento.push(dataPagamento);
	}
	return datasPagamento;
}

function calcularDatasParcelas(dataVenda, numeroParcelas){
	var datasParcelas = new Array();
	var data1aParcela = dataVenda.clone();
	data1aParcela.add(31, 'days');
	datasParcelas.push(moment(data1aParcela));
	for(i=1;i<numeroParcelas;i++){
		var dataProximaParcela = data1aParcela.clone();
		dataProximaParcela.add(i, 'months');
		datasParcelas.push(moment(dataProximaParcela));
	}
	return datasParcelas;
}

function limpar() {
	habilitarCamposParaCalculo();
	limparTabelaResultados();
	$("#tabela-resultados").hide();
}

function habilitarParcelamento(){
	var tipoCartao = $("#tipo-cartao").val();
	if(tipoCartao == 1){
		$("#parcelamento").show();
	} else $("#parcelamento").hide();
}

function montarTabelaResultados(numeroParcelas, datas, valores){
	for(i=1;i<=numeroParcelas;i++){
		addLinhaTabelaResultados(i, datas[i-1], parseFloat(valores[i-1].toString()));
	}
	var valorLiquidoTotal = Big(0);
	for(i=0;i<valores.length;i++){
		valorLiquidoTotal = valorLiquidoTotal.plus(valores[i]);
	}
	addRodapeTabelaResultados(parseFloat(valorLiquidoTotal.toString()));
}

function addLinhaTabelaResultados(parcela, data, valor){
    $("#tabela-resultados tbody").append(
    	"<tr>"+
	        "<td>"+ parcela +"</td>"+
	        "<td>"+ data.format('L') +"</td>"+
	        "<td>"+ accounting.formatMoney(valor, "R$", 2, ".", ",") +"</td>"+
        "</tr>");
}

function addRodapeTabelaResultados(valorLiquidoTotal){
    $("#tabela-resultados tfoot").append(
    	"<tr>"+
	        "<th colspan='2'>Total</th>"+
	        "<th>"+ accounting.formatMoney(valorLiquidoTotal, "R$", 2, ".", ",") +"</th>"+
        "</tr>");
}

function limparTabelaResultados() {
    $("#tabela-resultados tbody tr").remove();
    $("#tabela-resultados tfoot tr").remove();
}

function ehDiaUtil(diaDaSemana){
	// dias nao úteis retornados pelo moment.js [0,6];
	var diasNaoUteis = [0,6];
	if($.inArray(diaDaSemana, diasNaoUteis) == -1){
		return true;
	} else return false;
}

function calcularValores(valorVenda, tipoCartao, bandeiraCartao, numeroParcelas){
	var valores = new Array();
	var valorBruto = Big(valorVenda);
	var valorBrutoParcela = valorBruto.div(numeroParcelas);

	if(tipoCartao == 1){
		if(ehDizimaPeriodica(valorVenda, numeroParcelas)){
			valorBrutoParcela = valorBrutoParcela.round(2,0);
			var ajuste = valorBruto.minus(valorBrutoParcela.times(numeroParcelas));
			var valorBrutoParcela1 = Big(valorBrutoParcela.plus(ajuste));
			var valorLiquidoParcela1 = calcularValorLiquidoParcela(valorBrutoParcela1, tipoCartao, bandeiraCartao, numeroParcelas);
			valores.push(valorLiquidoParcela1);
			var valorLiquidoDemaisParcelas = calcularValorLiquidoParcela(valorBrutoParcela, tipoCartao, bandeiraCartao, numeroParcelas);
			for(i=2;i<=numeroParcelas;i++){
				valores.push(valorLiquidoDemaisParcelas);
			}
		} else {
			var valorLiquidoTodasParcelas = calcularValorLiquidoParcela(valorBrutoParcela, tipoCartao, bandeiraCartao, numeroParcelas);
			for(i=1;i<=numeroParcelas;i++){
				valores.push(valorLiquidoTodasParcelas);
			}		
		}
	} else if(tipoCartao == 2){
		var valorLiquidoParcela = calcularValorLiquidoParcela(valorBrutoParcela, tipoCartao, bandeiraCartao, numeroParcelas);
		valores.push(valorLiquidoParcela);
	}
	return valores;	
}

function calcularValorLiquidoParcela(valorBrutoParcela, tipoCartao, bandeiraCartao, numeroParcelas){
	var fator = Big(new Big(1).minus(obterPercentualDesconto(tipoCartao, bandeiraCartao, numeroParcelas)));
	var float = parseFloat(fator.toString());
	var valorLiquidoParcela = valorBrutoParcela.times(float);
	valorLiquidoParcela = valorLiquidoParcela.round(2,1);
	return valorLiquidoParcela;
}

function obterPercentualDesconto(tipoCartao, bandeiraCartao, numeroParcelas){
	var percentualDesconto;
	if(tipoCartao == 1){
		// cartão de crédito
		if(bandeiraCartao == 5){
			percentualDesconto = new Big(0.041);
		} else {
			switch(numeroParcelas){
				case 1:
					percentualDesconto = new Big(0.0252);
					break;
				case 2:
				case 3:
					percentualDesconto = new Big(0.0327);
					break;
				case 4:
				case 5:
				case 6:
					percentualDesconto = new Big(0.0352);
					break;
				default:
					percentualDesconto = new Big(0.0402);
					break;
			}
		}
	} else if(tipoCartao == 2){
		// cartão de débito	
		percentualDesconto = new Big(0.0174);
	}
	return percentualDesconto;
}

function ehDizimaPeriodica(numerador, denominador){
	var strValor = new Fraction(numerador, denominador).toString();
	if(strValor.indexOf("(") != -1 && strValor.indexOf(")") != -1){
		return true;
	} else return false;	
}

function validarCamposObrigatorios(dataVenda, valorVenda){
	var retorno = true;
	if(!dataVenda.isValid()){
		alert("Data da Venda inválida!");
		retorno = false;
	}
	if(valorVenda <= 0){
		alert("Valor inválido!");
		retorno = false;
	}
	return retorno;
}
