export const ENGLISH_STOPWORDS = new Set(
  "a an and are as at be been but by can could did do does for from had has have he her hers him his how i if in into is it its may more most no not of on or our ours she should so than that the their them then there these they this those to too under up us was we were what when where which who why will with would you your".split(" "),
);

export const PORTUGUESE_STOPWORDS = new Set(
  "a ao aos as com como da das de dela dele do dos e ela ele em entre era essa esse esta este eu foi foram ha há isso isto ja já mais mas me meu minha muito na nas nao não no nos nos nós o os ou para pela pelo por qual que quem se sem ser seu sua tambem também tem um uma voce você".split(" "),
);

export const STOPWORDS = new Set([...ENGLISH_STOPWORDS, ...PORTUGUESE_STOPWORDS]);
