my $c    = 'green|emerald|amber|yellow|red|rose|blue|violet|purple|orange';
my $pre  = '(?<![\w:/-])';
my $post = '(?![\w/-])';

# backgrounds: 50 -> /10, 100 -> /15 (keeps any /opacity and trailing !)
s{${pre}(bg-($c)-(50|100)(?:/\d+)?(!?))${post}}{"$1 dark:bg-$2-500/".($3 eq '50' ? '10' : '15').$4}ge;
# hover backgrounds
s{${pre}(hover:bg-($c)-(50|100)(!?))${post}}{"$1 dark:hover:bg-$2-500/20$4"}ge;
# text: 600/700 -> 400, 800/900 -> 200
s{${pre}(text-($c)-(600|700|800|900)(!?))${post}}{"$1 dark:text-$2-".($3 >= 800 ? '200' : '400').$4}ge;
# borders and rings
s{${pre}(border-($c)-(100|200|300)(!?))${post}}{"$1 dark:border-$2-500/30$4"}ge;
s{${pre}(ring-($c)-(100|200)(!?))${post}}{"$1 dark:ring-$2-500/30$4"}ge;
