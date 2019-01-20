struct A {
     int b;
     int c;
 };
 int f() {
    return 1337;
 }

 int main()
 {
     A a;
     a.b = f();
     return a.b + 5;
 }