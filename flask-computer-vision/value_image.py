import urllib.request as urllib
from money_parser import price_str
import re


class AppURLopener(urllib.FancyURLopener):
    version = "Mozilla/5.0"


opener = AppURLopener()


class ValueImage():
    def __init__(self):
        pass

    def value_label(self, label):
        res = opener.open(
            "https://camelcamelcamel.com/search?sq=%s" % label).read()
        prices = [re.sub("[\$,]", "", x)
                  for x in re.findall(r"\$[0-9,.]+", str(res))]
        parsed_prices = []
        for price in prices:
            try:
                float_price = float(price)
                if float_price == 0:
                    continue
                parsed_prices.append(float_price)
            except:
                continue
        if len(parsed_prices) == 0:
            return 'Unknown'
        return sum(parsed_prices) / len(parsed_prices)
