//#include <stdio.h> geht aktuell nicht

int x = 0;

struct tag_name {
   int member1;
   char member2;
   /* declare as many members as desired, but the entire structure size must be known to the compiler. */
};

int fibonacci(int i) {
    if (i <= 1) {
        return 1;
    }
    return fibonacci(i-1) + fibonacci(i-2);
}

int main()
{
    int i;
    i = 0;
    while (i <= 12) {
        //printf("fibonacci(%2d) = %d\n", i, fibonacci(i));
        print(fibonacci(i));
        i = i + 1;

    }
    tag_name t;
    t.member1 = 123456789;
    //int *ptr = &j;
    return t.member1;
}