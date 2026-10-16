export class GeradorCodigo{
    static codigo: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

    static aleatorioInt(min:number, max:number) : number{
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

    static gerar() : string {
        const elementos : string[] = [];
        
        for(var i = 0; i < 6; i++){
            elementos.push(this.codigo.charAt(GeradorCodigo.aleatorioInt(0, this.codigo.length - 1)));
        }

        return elementos.join('');
    }

}