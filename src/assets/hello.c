//#include <stdio.h> geht aktuell nicht


struct tag_name {
   type member1;
   type member2;
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
    while (i <= 10) {
        fibonacci(i);
        //printf("fibonacci(%2d) = %d\n", i, fibonacci(i));
        i = i + 1;
    }
    return 0;
}