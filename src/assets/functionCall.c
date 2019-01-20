struct A {
     int b;
     int c;
 };
 int f(int i) {
    if(i > 3) {
        return 123;
    }
    return 1337;
 }

 int main()
 {
     A a;
     a.b = f(0);
     return a.b + 5;
 }