import sys,os
sys.path.append(os.path.abspath(os.path.dirname(__file__))+'/lib')
from db_core import *

class Bank(ioDBT):
    def __init__(self,id,val,templ_num,cat_id=15):
#        self.cat_id = 15
#        self.org_id = 3
        adate = {'templ_num' : templ_num}
        super().__init__(id,val,adate,cat_id,org_id)

if __name__ == "__main__":
    Bank(1, 'Банк "Открытие" Точка', 2)
    Bank(2, 'Банк "Открытие"', 1)
    #reg(Banks(3, 'Сбербанк', 3))
    CommitTemplates()

#Перевести 91,93 из main.t_org_attr
