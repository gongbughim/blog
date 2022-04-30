---
title: 함수형 프로그래밍의 도 2장 - 합성
publishedAt: '2022-04-24'
summary: 함수형 프로그래밍의 도 2장을 읽고 요약했습니다
---

Bartosz Milewski의 [함수형 프로그래밍의 도 The Dao of Functional
Programming](https://github.com/BartoszMilewski/Publications/tree/master/TheDaoOfFP)
2장 "합성Composition"을 읽고 요약했습니다.

전체 목차를 보려면 [함수형 프로그래밍의 도](/posts/dao-fp)를 읽어주세요.

## 2.1. 합성Composition

프로그래밍에 있어서 가장 중요한 개념 중 하나는 합성composition입니다. 범주론에서 대상과
사상(화살표)을 다루는 이유도 마찬가지입니다.

대상 $a$에서 $b$로 향하는 사상 $f$와, 대상 $b$에서 $c$로 향하는 사상 $g$가 있으면 이를
합성하여 $a$에서 $c$로 향하는 사상 $h$를 만들 수 있습니다.

```render-category
a -> b [label=f]
b -> c [label=g]
a -> c [label=h, constraint=false]
```

이는 수학에서 함수의 합성과 같으며 이렇게 표기합니다.

$$
h = g \circ f
$$

해스켈에서는 이렇게 씁니다.

```haskell
h = g . f
```

수학적 표기와 (대부분의) 프로그래밍 언어의 문법이 위 그래프와 반대인 이유는 함수의 인자를 함수
이름 뒤에 적는 관습 때문입니다. $h = g(f(x))$ 처럼요.

영어로는 "$h$ is equal to $g$ after $f$"라고 읽으면 자연스러운데, 우리말로 $g$와 $f$의
순서를 바꾸지 않고 자연스럽게 읽을 방법은 아직 모르겠습니다.

만약 위 예시에서 $g$가 사실은 $j$와 $k$의 합성이라고 가정해보면 이렇게 쓸 수 있습니다.

$$
h = (j \circ k) \circ f
$$

범주론의 합성은 수학에서의 합성과 마찬가지로 **결합법칙associativity**이 성립하기 때문에
위 식은 아래처럼 쓸 수 있습니다.

$$
h = j \circ (k \circ f)
$$

따라서 괄호는 생략할 수 있습니다.

$$
h = j \circ k \circ f
$$

---

사상들morphisms 사이의 대응mappings인 **전합성pre-composition**과
**후합성post-composition**이 존재합니다.

사상 $f$가 사상 $h$에 후합성되면 사상 $f \circ h$가 만들어집니다. $f$에 의한 후합성을
$(f \circ -)$으로 표현합니다. $f: a \rightarrow b$ 라면, $a$로 향하는 어떠한 사상도
모두 $f$에 의해 후합성될 수 있습니다. 따라서 사상 $f \circ h$는 사상들 간의 대응
$(f \circ -)$를 만들내는데, 이 대응은 $a$를 향하는 사상들을 $b$로 향하는 사상들로 변환하는
역할을 합니다.

```render-category
rankdir=TD;
a -> b [label="f"];
{x1 x2} -> a;
{y1 y2} -> b;

{rank = same; a; b;}
{rank = same; x1; x2; y1; y2}
x2 -> y1 [label="(f ∘ −)"; style="dashed"];
```

즉, 무언가로부터 $a$를 만들어내는 사상들($x_1, x_2, ...$)을, 무언가로부터 $b$를 만들어내는
사상들($y_1, y_2, ...$)로 바꿔줍니다.

해스캘 코드로 최대한 명시적으로 표현해보면 이렇습니다.

```haskell
h :: Int -> Bool
h x = x /= 0

f :: Bool -> String
f False = "False"
f True = "True"

g :: Int -> String
g = f . h
```

`h`는 `Int`를 받아서 `Bool`을 반환하는 함수입니다. `Bool`을 받아서 `String`을 반환하는
함수 `f`를 `h`에 후합성한 `g`는 `Int`를 받아서 `String`을 반환하는 함수가 됩니다.
즉, `Bool`을 반환하는 임의의 함수에 `f`를 후합성하면 그 결과로 얻어지는 함수들은 `String`을
반환합니다.

후합성의 **쌍대dual** 개념은 전합성입니다. $f$의 전합성은 $(- \circ f)$이며, $a$로부터
무언가를 만들어내는 사상들($x_1, x_2, ...$)을 $b$로부터 무언가를 만들어내는
사상들($y_1, y_2, ...$)로 바꿔줍니다.

```render-category
rankdir=TD;
overlap = false;

a -> b [label="f"];
a -> {x1 x2};
b -> {y1 y2};

x2 -> y1 [label="(- ∘ f)"; style="dashed"; dir=back];

{rank = same; a; b;}
{rank = same; x1; x2; y1; y2}
```

전합성과 후합성은 각각 $(- \circ -)$에 대한 **부분 적용partial application**으로 볼 수
있습니다.

프로그래밍에서 밖으로 향하는 화살표들은 소스로부터 데이터를 추출한다는 의미이며, 안으로 들어오는
화살표들은 무언가를 만들어낸다는 의미입니다. 나가는 화살표는 인터페이스, 들어오는 화살표는
생성자라고 말할 수 있습니다.

## 2.2. 함수 적용Function application

끝 대상terminal object에서 $a$로 향하는 사상 $x$를 $a$의 **원소element**로 볼 수
있습니다.

$$
1 \overset{x}{\rightarrow} a
$$

여기에 $a$에서 $b$로 향하는 사상 $f$를 합성하여 사상 $y$를 얻을 수 있습니다.

```render-category
1 -> a [label=x];
a -> b [label=f];
1 -> b [label=y, constraint=false];
```

이때 $y$는 $b$의 원소라고 할 수 있으며, $f$는 $a$의 원소를 $b$의 원소로 대응시키는 역할을
합니다. 이걸 $x$를 함수 $f$에 **적용application**한다고 부릅니다. 함수의 적용은 이렇게
표현합니다.

$$
y = fx
$$

일반적인 프로그래밍 언어, 예를 들어 자바스크립트에서는 이렇게 표현합니다.

```javascript
const y = f(x)
```

## 2.3. 항등Identity

사상은 변화를 나타낸다고 볼 수도 있습니다. 대상 $a$가 대상 $b$로 바뀌니까요. $a$에서 $a$로
향하는 사상은 대상 그 자체의 변화를 나타냅니다. 하지만 변화에도 쌍대dual가 존재합니다. 변화가
없는 것, 즉 **항등identity**입니다.

**범주category**의 모든 대상은 특별한 사상으로 항등을 가집니다. 대상 $a$에 대한 항등 사상을
$id_a$로 표시합니다.

사상 $f: a \rightarrow b$가 있을 때 다음이 성립합니다.

$$
id_b \circ f = f = f \circ id_a
$$

그림으로는 이렇게 표현합니다.

```render-category
a -> b [label="f"];
a -> a [label="id_a"];
b -> b [label="id_b"];
```

해스켈에서는 `id` 함수가 항등을 나타냅니다.

```haskell
id x = x
```

논리학에서는 **항등명제tautology**라고 부릅니다. "a가 참이라면 a는 참이다"라는 의미입니다.

---

전체 목차를 보려면 [함수형 프로그래밍의 도](/posts/dao-fp)를 읽어주세요.
