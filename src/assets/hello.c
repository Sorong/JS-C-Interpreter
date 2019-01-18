//#include <stdio.h> geht aktuell nicht


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
    int i,j;
    i = 0;
    while (i <= 10) {
        fibonacci(i);
        //printf("fibonacci(%2d) = %d\n", i, fibonacci(i));
        i = i + 1;

    }
    int *ptr = &j;
    return 0;
}