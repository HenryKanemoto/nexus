import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity('itens')
export class ItemEntity {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({length:50, nullable:false})
    nome:string;

    @Column({length:50, nullable:false})
    tipo:string;

    @Column({
        type:'enum',
        enum:['True', 'False'],
        default: 'False'
    })
    emprestado: 'True'|'False';
    
    @Column({name:'dataEmprestado',type: 'datetime', nullable:true})
    dataEmprestado:Date|null;

}