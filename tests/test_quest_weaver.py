import importlib.util
import json
import pathlib
import sys
import types
import pytest

CONTRACT_PATH = pathlib.Path(__file__).resolve().parents[1] / "contracts" / "quest_weaver.py"

# ── GenLayer runtime stubs ───────────────────────────────────────────────────
class _UserError(Exception):
    pass

class _VmModule:
    UserError = _UserError

class _TreeMap:
    def __init__(self):
        self._data = {}
        
    def __getitem__(self, key):
        return self._data[key]
        
    def __setitem__(self, key, value):
        self._data[key] = value
        
    def __contains__(self, key):
        return key in self._data
        
    def exists(self, key):
        return key in self._data
        
    def __class_getitem__(cls, item):
        return cls

class _U256(int):
    def __new__(cls, v):
        return super().__new__(cls, int(v))

class _PublicViewDeco:
    def __call__(self, fn):
        return fn

class _PublicWriteDeco:
    payable = staticmethod(lambda fn: fn)

    def __call__(self, fn):
        return fn

class _Public:
    view = _PublicViewDeco()
    write = _PublicWriteDeco()

class _EqPrinciple:
    canned_output = '{"verdict": "APPROVED"}'

    @classmethod
    def strict_eq(cls, fn):
        cls.last_input = fn()
        return cls.canned_output

    @classmethod
    def prompt_comparative(cls, fn, prompt):
        cls.last_input = fn()
        return cls.canned_output

class _NondetWeb:
    pass

class _Nondet:
    web = _NondetWeb()

    @staticmethod
    def exec_prompt(prompt, response_format=None):
        return _EqPrinciple.canned_output

class _Evm:
    @staticmethod
    def contract_interface(cls):
        class _Proxy:
            def __init__(self, addr):
                self._addr = str(addr)

            def emit_transfer(self, value, on=None):
                _GL._emit.transfers.append((self._addr, int(value), on))
        return _Proxy

class _GL:
    class Contract:
        pass

    evm = _Evm()
    public = _Public()
    vm = _VmModule
    eq_principle = _EqPrinciple
    nondet = _Nondet()

    class message:
        sender_address = "0x0000000000000000000000000000000000000000"
        value = 0

    _emit = None

class _Address(str):
    def __new__(cls, v):
        if isinstance(v, _Address):
            raise TypeError("cannot convert 'Address' object to bytes")
        return super().__new__(cls, v)
        
    @property
    def as_hex(self):
        return str(self)

class _FakeEmit:
    def __init__(self):
        self.transfers = []   # (to, value, on)

    def total_to(self, addr):
        return sum(v for (t, v, _) in self.transfers if t.lower() == addr.lower())

def _install_stub():
    if "genlayer" in sys.modules:
        return
    mod = types.ModuleType("genlayer")
    mod.gl = _GL
    mod.TreeMap = _TreeMap
    mod.u256 = _U256
    mod.Address = _Address
    mod.__all__ = ["gl", "TreeMap", "u256", "Address"]
    sys.modules["genlayer"] = mod

_install_stub()

def _load_contract():
    spec = importlib.util.spec_from_file_location("qw_contract", CONTRACT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.QuestWeaver

@pytest.fixture
def qw():
    _GL._emit = _FakeEmit()
    _GL.message.sender_address = _Address("0x1111000000000000000000000000000000000000")
    _GL.message.value = 0
    ContractClass = _load_contract()
    
    # Manually inject state dicts
    inst = ContractClass()
    inst.realms = _TreeMap()
    inst.quests = _TreeMap()
    inst.submissions = _TreeMap()
    inst.canon = _TreeMap()
    return inst

def test_bounty_payout(qw):
    # Creator creates realm and posts quest
    creator = _Address("0xC000000000000000000000000000000000000000")
    _GL.message.sender_address = creator
    r_id = qw.create_realm("Test Realm", "Law 1")
    
    _GL.message.value = 10000
    q_id = qw.post_quest(r_id, "Test Quest", "Description")
    
    # Author submits lore
    author = _Address("0xA000000000000000000000000000000000000000")
    _GL.message.sender_address = author
    s_id = qw.submit_lore(q_id, "My lore submission")
    
    # Evaluate submission (mocked to approve)
    _GL.eq_principle.canned_output = '{"verdict": "APPROVED", "reasoning": "mock"}'
    res = qw.evaluate_submission(s_id)
    
    assert res == "APPROVED"
    
    # Check if author received bounty
    assert _GL._emit.total_to(author) == 10000
    
def test_quest_cancellation(qw):
    creator = _Address("0xC000000000000000000000000000000000000000")
    _GL.message.sender_address = creator
    r_id = qw.create_realm("Test Realm", "Law 1")
    
    _GL.message.value = 5000
    q_id = qw.post_quest(r_id, "Quest to Cancel", "Cancel me")
    
    # Someone else tries to cancel
    _GL.message.sender_address = _Address("0xB000000000000000000000000000000000000000")
    with pytest.raises(_VmModule.UserError, match="Only the creator"):
        qw.cancel_quest(q_id)
        
    # Creator cancels
    _GL.message.sender_address = creator
    res = qw.cancel_quest(q_id)
    assert res == "CANCELLED"
    
    # Check if creator got refund
    assert _GL._emit.total_to(creator) == 5000
    
    # Check quest state
    q = json.loads(qw.quests[q_id])
    assert q["status"] == "CANCELLED"

def test_rejection_no_payout(qw):
    creator = _Address("0xC000000000000000000000000000000000000000")
    _GL.message.sender_address = creator
    r_id = qw.create_realm("Test Realm", "Law 1")
    
    _GL.message.value = 10000
    q_id = qw.post_quest(r_id, "Test Quest", "Description")
    
    # Author submits lore
    author = _Address("0xA000000000000000000000000000000000000000")
    _GL.message.sender_address = author
    s_id = qw.submit_lore(q_id, "Bad lore submission")
    
    # Evaluate submission (mocked to reject)
    _GL.eq_principle.canned_output = '{"verdict": "REJECTED", "reasoning": "mock"}'
    res = qw.evaluate_submission(s_id)
    
    assert res == "REJECTED"
    
    # Check if author received bounty
    assert _GL._emit.total_to(author) == 0
    # No refund to creator either, quest is still OPEN
    assert _GL._emit.total_to(creator) == 0
