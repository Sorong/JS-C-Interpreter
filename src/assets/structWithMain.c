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
    a.b = 42;
    return a.b;
}