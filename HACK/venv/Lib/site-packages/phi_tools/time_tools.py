# -*- ecoding: utf-8 -*-
# @ModuleName: phi_tool.py
# @Function: 一些工具方法
# @Author: ctx_phi
# @Craete Time: 2021/11/4 10:37

import pandas as pd
from datetime import datetime


def datelist(self, beginDate, endDate):
    '''
    根据st和et生成日期列表
    '''
    # beginDate, endDate是形如‘20160601’的字符串或datetime格式
    date_l=[datetime.strftime(x,'%Y-%m-%d %H:%M:%S') for x in list(pd.date_range(start=beginDate, end=endDate))]
    return date_l


def caltime(func):
    def inner(*args, **kwargs):
        start = datetime.now()
        res = func(*args, **kwargs)
        end = datetime.now()
        print("methods: %s ,运行共计耗时: %s s"%(func.__name__,  end - start))
        return res
    return inner

# if __name__ =='__main__':
    # @calcMethodsTimes
    # def test():
    #     print('test')
    
    # test()

