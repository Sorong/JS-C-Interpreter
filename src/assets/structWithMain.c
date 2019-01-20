struct A {
     int b;
     int c;
 };
 void f() {
     A a;
     a.b = 42;
 }

 int main(int argc, char* argv[])
 {
     A a;
     a.b = 42 + 3 ;
     return a.b + 5;
 }